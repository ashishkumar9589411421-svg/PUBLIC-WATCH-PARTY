const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3-30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username: username.toLowerCase(),
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats,
          createdAt: user.createdAt
        }
      }
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if banned
    if (user.isUserBanned()) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned',
        reason: user.banReason,
        bannedUntil: user.bannedUntil
      });
    }

    // Update last login
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await user.updateLastLogin(ip, userAgent, null);

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId)
      .populate('roomsCreated', 'code name isActive createdAt')
      .populate('roomsJoined', 'code name isActive createdAt');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats,
          roomsCreated: user.roomsCreated,
          roomsJoined: user.roomsJoined,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post(
  '/logout',
  auth,
  asyncHandler(async (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // Here we can add any server-side cleanup if needed
    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  })
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (placeholder for email integration)
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please enter a valid email')],
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions'
      });
    }

    // TODO: Implement email sending
    // For now, just return success message
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions'
    });
  })
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  auth,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, avatar, preferences } = req.body;
    const user = await User.findById(req.userId);

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username.toLowerCase();
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          preferences: user.preferences,
          stats: user.stats
        }
      }
    });
  })
);

module.exports = router;
