import { RequestHandler } from "express";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DatabaseService } from '../services/database';
import { sendPasswordResetEmail } from '../services/emailService';

const SALT_ROUNDS = 10;

// JSON file operations (fallback when Supabase is not available)
const USERS_FILE = path.join(process.cwd(), 'server', 'data', 'users.json');
const RESET_TOKENS_FILE = path.join(process.cwd(), 'server', 'data', 'resetTokens.json');

function loadUsers(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Failed to load users:', e);
    return [];
  }
}

function saveUsers(users: any[]) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

function loadResetTokens(): Record<string, { email: string; expires: number }> {
  try {
    if (!fs.existsSync(RESET_TOKENS_FILE)) return {};
    const raw = fs.readFileSync(RESET_TOKENS_FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('Failed to load reset tokens:', e);
    return {};
  }
}

function saveResetTokens(tokens: Record<string, { email: string; expires: number }>) {
  try {
    const dir = path.dirname(RESET_TOKENS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save reset tokens:', e);
  }
}

// Check if Supabase is available
function isSupabaseAvailable(): boolean {
  try {
    // Try to access the supabase client
    const { supabase } = require('../lib/supabase');
    return supabase !== null;
  } catch (error) {
    return false;
  }
}

// User signup
export const userSignup: RequestHandler = async (req, res) => {
  try {
    const { fullName, email, phone, password, userType = 'customer' } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: fullName, email, phone, password' 
      });
    }

    if (isSupabaseAvailable()) {
      // Use Supabase
      const existingUser = await DatabaseService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = await DatabaseService.createUser({
        full_name: fullName,
        email,
        phone,
        password: hashedPassword,
        user_type: userType,
        is_active: true
      });

      const { password: _, ...userResponse } = newUser;
      res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });
    } else {
      // Use JSON fallback
      const users = loadUsers();
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User with this email already exists' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = {
        id: `USR-${String(users.length + 1).padStart(3, '0')}`,
        fullName,
        email,
        phone,
        password: hashedPassword,
        userType,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);

      const { password: _, ...userResponse } = newUser;
      res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });
    }
  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// User login
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (isSupabaseAvailable()) {
      // Use Supabase
      const user = await DatabaseService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      if (!user.is_active) {
        return res.status(401).json({ 
          error: 'Account is deactivated' 
        });
      }

      if (userType && user.user_type !== userType) {
        return res.status(401).json({ 
          error: 'Invalid user type for this account' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      const { password: _, ...userResponse } = user;
      res.json({
        message: 'Login successful',
        user: userResponse
      });
    } else {
      // Use JSON fallback
      const users = loadUsers();
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          error: 'Account is deactivated' 
        });
      }

      if (userType && user.userType !== userType) {
        return res.status(401).json({ 
          error: 'Invalid user type for this account' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      const { password: _, ...userResponse } = user;
      res.json({
        message: 'Login successful',
        user: userResponse
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Forgot password
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    if (isSupabaseAvailable()) {
      // Use Supabase
      try {
        const user = await DatabaseService.getUserByEmail(email);
        if (!user) {
          // Don't reveal if email exists or not for security
          return res.json({ 
            message: 'If the email exists, a password reset link has been sent' 
          });
        }

        await DatabaseService.createResetToken({
          token,
          email,
          expires
        });
      } catch (error) {
        console.error('Supabase error in forgotPassword:', error);
        // Fall back to JSON
      }
    }

    // Always save to JSON as backup
    const tokens = loadResetTokens();
    tokens[token] = { email, expires };
    saveResetTokens(tokens);

    // Send reset email
    try {
      // Get the correct origin for the reset link
      const origin = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : (req.protocol + '://' + req.get('host'));
      await sendPasswordResetEmail(email, token, origin);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Continue anyway - token is still valid
    }

    res.json({ 
      message: 'If the email exists, a password reset link has been sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Failed to process password reset request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reset password
export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }

    let resetToken = null;
    let email = null;

    // Try Supabase first
    if (isSupabaseAvailable()) {
      try {
        resetToken = await DatabaseService.getResetToken(token);
        if (resetToken) {
          email = resetToken.email;
          
          // Check if token is expired
          if (Date.now() > resetToken.expires) {
            await DatabaseService.deleteResetToken(token);
            return res.status(400).json({ 
              error: 'Reset token has expired' 
            });
          }
        }
      } catch (error) {
        console.error('Supabase error in resetPassword:', error);
      }
    }

    // Fallback to JSON
    if (!resetToken) {
      const tokens = loadResetTokens();
      const entry = tokens[token];
      if (!entry || entry.expires < Date.now()) {
        return res.status(400).json({ 
          error: 'Invalid or expired reset token' 
        });
      }
      email = entry.email;
    }

    if (!email) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password in Supabase
    if (isSupabaseAvailable()) {
      try {
        const user = await DatabaseService.getUserByEmail(email);
        if (user) {
          await DatabaseService.updateUser(user.id, { password: hashedPassword });
          await DatabaseService.deleteResetToken(token);
          return res.json({ 
            message: 'Password reset successfully' 
          });
        }
      } catch (error) {
        console.error('Supabase error updating password:', error);
      }
    }

    // Fallback to JSON
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].password = hashedPassword;
      saveUsers(users);
      
      // Clean up token
      const tokens = loadResetTokens();
      delete tokens[token];
      saveResetTokens(tokens);
      
      return res.json({ 
        message: 'Password reset successfully' 
      });
    }

    res.status(404).json({ 
      error: 'User not found' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user profile
export const getProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (isSupabaseAvailable()) {
      const user = await DatabaseService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }
      const { password: _, ...userResponse } = user;
      res.json({ user: userResponse });
    } else {
      const users = loadUsers();
      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }
      const { password: _, ...userResponse } = user;
      res.json({ user: userResponse });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user profile
export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, phone, email } = req.body;

    if (isSupabaseAvailable()) {
      const existingUser = await DatabaseService.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      if (email && email !== existingUser.email) {
        const emailExists = await DatabaseService.getUserByEmail(email);
        if (emailExists) {
          return res.status(409).json({ 
            error: 'Email already in use' 
          });
        }
      }

      const updateData: any = {};
      if (fullName) updateData.full_name = fullName;
      if (phone) updateData.phone = phone;
      if (email) updateData.email = email;

      const updatedUser = await DatabaseService.updateUser(userId, updateData);
      const { password: _, ...userResponse } = updatedUser;

      res.json({
        message: 'Profile updated successfully',
        user: userResponse
      });
    } else {
      const users = loadUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      if (fullName) users[userIndex].fullName = fullName;
      if (phone) users[userIndex].phone = phone;
      if (email) users[userIndex].email = email;

      saveUsers(users);
      const { password: _, ...userResponse } = users[userIndex];

      res.json({
        message: 'Profile updated successfully',
        user: userResponse
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all users (admin only)
export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    if (isSupabaseAvailable()) {
      const users = await DatabaseService.getUsers();
      const usersResponse = users.map(({ password, ...user }) => user);
      res.json({ users: usersResponse });
    } else {
      const users = loadUsers();
      const usersResponse = users.map(({ password, ...user }) => user);
      res.json({ users: usersResponse });
    }
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Toggle user status (admin only)
export const toggleUserStatus: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        error: 'isActive must be a boolean value' 
      });
    }

    if (isSupabaseAvailable()) {
      const user = await DatabaseService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      const updatedUser = await DatabaseService.updateUser(userId, { is_active: isActive });
      const { password: _, ...userResponse } = updatedUser;

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: userResponse
      });
    } else {
      const users = loadUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      users[userIndex].isActive = isActive;
      saveUsers(users);
      const { password: _, ...userResponse } = users[userIndex];

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: userResponse
      });
    }
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      error: 'Failed to update user status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete user (admin only)
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (isSupabaseAvailable()) {
      const user = await DatabaseService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      await DatabaseService.deleteUser(userId);
      res.json({ 
        message: 'User deleted successfully' 
      });
    } else {
      const users = loadUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      users.splice(userIndex, 1);
      saveUsers(users);
      res.json({ 
        message: 'User deleted successfully' 
      });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
