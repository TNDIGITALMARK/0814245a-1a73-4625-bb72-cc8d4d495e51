import express from 'express';
import Joi from 'joi';
import User from '../models/User';
import { authenticate, generateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 20 characters'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long'
    }),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  dateOfBirth: Joi.date().max('now').optional()
});

const loginSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  bio: Joi.string().max(500).optional(),
  location: Joi.string().max(100).optional(),
  preferences: Joi.object({
    favoriteCategories: Joi.array().items(
      Joi.string().valid('action', 'puzzle', 'arcade', 'strategy', 'casual', 'adventure', 'racing', 'sports')
    ).optional(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'expert').optional(),
    soundEnabled: Joi.boolean().optional(),
    notifications: Joi.boolean().optional()
  }).optional(),
  socialMedia: Joi.object({
    twitter: Joi.string().uri().optional().allow(''),
    facebook: Joi.string().uri().optional().allow(''),
    instagram: Joi.string().uri().optional().allow(''),
    discord: Joi.string().optional().allow('')
  }).optional()
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  const { username, email, password, firstName, lastName, dateOfBirth } = value;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    return res.status(400).json({
      success: false,
      message: `User with this ${field} already exists`
    });
  }

  // Create user
  const user = new User({
    username,
    email,
    password,
    profile: {
      firstName,
      lastName,
      dateOfBirth,
      preferences: {
        favoriteCategories: [],
        difficulty: 'medium',
        soundEnabled: true,
        notifications: true
      }
    }
  });

  await user.save();

  // Generate token
  const token = generateToken(user);

  // Remove password from response
  const userResponse = user.toJSON();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      token
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  const { usernameOrEmail, password } = value;

  // Find user by username or email
  const user = await User.findOne({
    $or: [
      { email: usernameOrEmail },
      { username: usernameOrEmail }
    ]
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update login stats
  user.stats.lastActive = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user);

  // Remove password from response
  const userResponse = user.toJSON();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token
    }
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  const user = req.user!;
  
  // Update profile fields
  if (value.firstName !== undefined) user.profile.firstName = value.firstName;
  if (value.lastName !== undefined) user.profile.lastName = value.lastName;
  if (value.bio !== undefined) user.profile.bio = value.bio;
  if (value.location !== undefined) user.profile.location = value.location;
  
  if (value.preferences) {
    if (value.preferences.favoriteCategories !== undefined) {
      user.profile.preferences.favoriteCategories = value.preferences.favoriteCategories;
    }
    if (value.preferences.difficulty !== undefined) {
      user.profile.preferences.difficulty = value.preferences.difficulty;
    }
    if (value.preferences.soundEnabled !== undefined) {
      user.profile.preferences.soundEnabled = value.preferences.soundEnabled;
    }
    if (value.preferences.notifications !== undefined) {
      user.profile.preferences.notifications = value.preferences.notifications;
    }
  }

  if (value.socialMedia) {
    user.socialMedia = { ...user.socialMedia, ...value.socialMedia };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON()
    }
  });
}));

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', authenticate, asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  const { currentPassword, newPassword } = value;

  // Get user with password
  const user = await User.findById(req.user!._id).select('+password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.'
  });
}));

// @route   DELETE /api/auth/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', authenticate, asyncHandler(async (req, res) => {
  const user = req.user!;
  
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  user.username = `deleted_${Date.now()}_${user.username}`;
  
  await user.save();

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
}));

// @route   GET /api/auth/stats
// @desc    Get user stats summary
// @access  Private
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const user = req.user!;
  
  res.json({
    success: true,
    data: {
      stats: user.stats,
      achievementsCount: user.achievements.length,
      friendsCount: user.friends.length,
      joinedDate: user.createdAt,
      isVerified: user.isVerified
    }
  });
}));

export default router;