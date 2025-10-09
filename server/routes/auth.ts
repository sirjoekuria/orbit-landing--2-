import { RequestHandler } from "express";
import { getRidersData } from "./riders";
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Persistent storage for users (simple JSON file). For production, use a real DB.
const USERS_FILE = path.join(process.cwd(), 'server', 'data', 'users.json');

// In-memory cache (loaded from disk)
let users: any[] = [];
let userIdCounter = 1;

import crypto from 'crypto';

// Reset tokens persisted to disk
const RESET_TOKENS_FILE = path.join(process.cwd(), 'server', 'data', 'resetTokens.json');

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

// Sample users for demonstration
const sampleUsers = [
  {
    id: 'USR-001',
    fullName: 'John Customer',
    email: 'john@customer.com',
    phone: '+254 712 345 678',
    password: 'password123', // In production, this would be hashed
    userType: 'customer',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helpers to persist users
function ensureUsersFile() {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(raw || '[]');
    userIdCounter = users.length + 1;
  } catch (err) {
    console.error('Failed to initialize users file, starting with empty in-memory users:', err);
    users = [];
    userIdCounter = 1;
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save users to disk:', err);
  }
}

// Initialize users from disk
ensureUsersFile();


// POST /api/users/signup - Create customer account
export const userSignup: RequestHandler = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      userType = 'customer'
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        error: 'All fields are required: fullName, email, phone, password'
      });
    }

    // Check if user already exists
    const existingUser = users.find(user =>
      user.email === email || user.phone === phone
    );

    if (existingUser) {
      return res.status(400).json({
        error: 'A user with this email or phone already exists'
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      id: `USR-${userIdCounter.toString().padStart(3, '0')}`,
      fullName,
      email,
      phone,
      password: hashedPassword,
      userType,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    userIdCounter++;
    saveUsers();

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/login - User login (handles both customers and riders)
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    let user = null;
    let foundUserType = null;

    // If userType is specified, search in the appropriate collection
    if (userType === 'rider') {
      // Search in riders collection
      const riders = getRidersData();
      user = riders.find((r: any) => r.email === email);
      foundUserType = 'rider';
    } else {
      // Search in users first (customers)
      user = users.find(u => u.email === email);
      foundUserType = user?.userType || 'customer';
    }

    // If not found and no userType specified, also search riders
    if (!user && !userType) {
      const riders = getRidersData();
      const riderUser = riders.find((r: any) => r.email === email);
      if (riderUser) {
        user = riderUser;
        foundUserType = 'rider';
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password (supports hashed and legacy plaintext)
    let passwordMatch = false;
    if (typeof user.password === 'string' && user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = user.password === password;
      if (passwordMatch) {
        // Migrate plaintext to hashed
        try {
          const hashed = await bcrypt.hash(password, SALT_ROUNDS);
          const idx = users.findIndex(u => u.email === email);
          if (idx !== -1) {
            users[idx].password = hashed;
            saveUsers();
          }
        } catch (e) {
          console.error('Failed to migrate plaintext password to hash:', e);
        }
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // For riders, check if they are approved and active
    if (foundUserType === 'rider') {
      if (user.status !== 'approved') {
        return res.status(401).json({
          error: 'Rider account is not yet approved. Please wait for admin approval.'
        });
      }
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Rider account is inactive. Please contact support.'
        });
      }
    } else {
      // For regular users, just check if active
      if (!user.isActive) {
        return res.status(401).json({
          error: 'Account is inactive. Please contact support.'
        });
      }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        ...userWithoutPassword,
        userType: foundUserType
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/auth/profile - Get user profile
export const getProfile: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      success: true, 
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/auth/profile/:userId - Update user profile
export const updateProfile: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, phone } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    if (fullName) users[userIndex].fullName = fullName;
    if (phone) users[userIndex].phone = phone;
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers();

    // Return user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/users - Get all users (admin only)
export const getAllUsers: RequestHandler = (req, res) => {
  try {
    // Return users without passwords
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    const sortedUsers = usersWithoutPasswords.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ 
      success: true, 
      users: sortedUsers,
      total: users.length,
      stats: {
        customers: users.filter(u => u.userType === 'customer').length,
        riders: users.filter(u => u.userType === 'rider').length,
        active: users.filter(u => u.isActive).length
      }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/users/:userId/status - Toggle user active status (admin only)
export const toggleUserStatus: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].isActive = isActive;
    users[userIndex].updatedAt = new Date().toISOString();
    saveUsers();

    // Return user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];

    res.json({ 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/admin/users/:userId - Delete user (admin only)
export const deleteUser: RequestHandler = (req, res) => {
  try {
    const { userId } = req.params;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    saveUsers();
    const { password: _, ...userWithoutPassword } = deletedUser;

    res.json({
    success: true,
    message: 'User deleted successfully',
    user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/forgot-password - send reset link to email
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Search users and riders
    let user = users.find(u => u.email === email);
    if (!user) {
      const riders = getRidersData();
      user = riders.find((r: any) => r.email === email);
    }

    if (!user) {
      // Do not reveal whether email exists, but proceed to send link for better UX
      console.log(`forgotPassword: email ${email} not found in users/riders — sending reset link for UX.`);
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour
    const tokens = loadResetTokens();
    tokens[token] = { email, expires };
    saveResetTokens(tokens);

    // Send email (use emailService)
    try {
      const { sendPasswordResetEmail } = await import('../services/emailService');
      // Prefer APP_URL env var for links (so reset URLs are reachable from other devices). Fallback to request origin.
      const origin = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : (req.protocol + '://' + req.get('host'));
      await sendPasswordResetEmail(email, token, origin);
    } catch (emailErr) {
      console.error('Failed to send password reset email:', emailErr);
    }

    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/auth/reset-password - reset password using token
export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword are required' });

    const tokens = loadResetTokens();
    const entry = tokens[token];
    if (!entry || entry.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const email = entry.email;

    // Find user in users
    let userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
      users[userIndex].password = hashed;
      saveUsers();
      delete tokens[token];
      saveResetTokens(tokens);
      return res.json({ success: true, message: 'Password updated successfully' });
    }

    // Else find in riders
    const riders = getRidersData();
    const rider = riders.find((r: any) => r.email === email);
    if (rider) {
      // Since riders are from a separate module, attempt to update via provided utilities
      const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
      try {
        const { updateRiderPassword } = await import('./riders');
        if (typeof updateRiderPassword === 'function') {
          updateRiderPassword(rider.id, hashed);
        } else {
          rider.password = hashed; // fallback
        }
      } catch (e) {
        rider.password = hashed;
      }

      delete tokens[token];
      saveResetTokens(tokens);
      return res.json({ success: true, message: 'Password updated successfully' });
    }

    res.status(404).json({ error: 'User not found' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
