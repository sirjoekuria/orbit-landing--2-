import { RequestHandler } from "express";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { DatabaseService } from '../services/database';
import { sendPasswordResetEmail } from '../services/emailService';

const SALT_ROUNDS = 10;

// User signup
export const userSignup: RequestHandler = async (req, res) => {
  try {
    const { fullName, email, phone, password, userType = 'customer' } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: fullName, email, phone, password' 
      });
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await DatabaseService.createUser({
      full_name: fullName,
      email,
      phone,
      password: hashedPassword,
      user_type: userType,
      is_active: true
    });

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
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

    // Find user by email
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Account is deactivated' 
      });
    }

    // Check user type if specified
    if (userType && user.user_type !== userType) {
      return res.status(401).json({ 
        error: 'Invalid user type for this account' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user profile
export const getProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await DatabaseService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({ user: userResponse });
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

    // Check if user exists
    const existingUser = await DatabaseService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await DatabaseService.getUserByEmail(email);
      if (emailExists) {
        return res.status(409).json({ 
          error: 'Email already in use' 
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (fullName) updateData.full_name = fullName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    // Update user
    const updatedUser = await DatabaseService.updateUser(userId, updateData);

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
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
    const users = await DatabaseService.getUsers();
    
    // Remove passwords from response
    const usersResponse = users.map(({ password, ...user }) => user);

    res.json({ users: usersResponse });
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

    const user = await DatabaseService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const updatedUser = await DatabaseService.updateUser(userId, { is_active: isActive });

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: userResponse
    });
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
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
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

    // Check if user exists
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If the email exists, a password reset link has been sent' 
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    // Save reset token
    await DatabaseService.createResetToken({
      token,
      email,
      expires
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(email, token);
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

    // Find reset token
    const resetToken = await DatabaseService.getResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Check if token is expired
    if (Date.now() > resetToken.expires) {
      await DatabaseService.deleteResetToken(token);
      return res.status(400).json({ 
        error: 'Reset token has expired' 
      });
    }

    // Find user by email
    const user = await DatabaseService.getUserByEmail(resetToken.email);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password
    await DatabaseService.updateUser(user.id, { password: hashedPassword });

    // Delete used reset token
    await DatabaseService.deleteResetToken(token);

    res.json({ 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
