const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, isBanned } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  })
);

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get(
  '/stats',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // User growth over last 7 days
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const count = await User.countDocuments({
        createdAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        }
      });
      userGrowth.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsersToday,
        bannedUsers,
        adminUsers,
        userGrowth
      }
    });
  })
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get(
  '/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-password -loginHistory')
      .populate('roomsCreated', 'code name isActive createdAt')
      .populate('roomsJoined', 'code name isActive createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  })
);

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put(
  '/:id/role',
  auth,
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('role').isIn(['user', 'moderator', 'admin']).withMessage('Invalid role')
  ],
  asyncHandler(async (req, res) => {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: user.profile }
    });
  })
);

// @route   POST /api/users/:id/ban
// @desc    Ban user (admin only)
// @access  Private/Admin
router.post(
  '/:id/ban',
  auth,
  adminOnly,
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('reason').optional().trim(),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer (hours)')
  ],
  asyncHandler(async (req, res) => {
    const { reason, duration } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent banning self
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban yourself'
      });
    }

    // Prevent banning other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    const durationMs = duration ? duration * 60 * 60 * 1000 : null;
    await user.ban(reason || 'Violation of terms', durationMs);

    res.json({
      success: true,
      message: 'User banned successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          isBanned: user.isBanned,
          banReason: user.banReason,
          bannedUntil: user.bannedUntil
        }
      }
    });
  })
);

// @route   POST /api/users/:id/unban
// @desc    Unban user (admin only)
// @access  Private/Admin
router.post(
  '/:id/unban',
  auth,
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.unban();

    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          isBanned: user.isBanned
        }
      }
    });
  })
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete(
  '/:id',
  auth,
  adminOnly,
  [param('id').isMongoId().withMessage('Invalid user ID')],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

module.exports = router;
