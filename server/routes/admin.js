const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const { auth, adminOnly } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get(
  '/dashboard',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Room stats
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ isActive: true });
    const roomsToday = await Room.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Most active room
    const mostActiveRoom = await Room.findOne({ isActive: true })
      .sort({ 'stats.peakParticipants': -1 })
      .populate('host', 'username')
      .limit(1);

    // Recent activity
    const recentUsers = await User.find()
      .select('-password -loginHistory')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRooms = await Room.find()
      .populate('host', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            newToday: newUsersToday,
            banned: bannedUsers
          },
          rooms: {
            total: totalRooms,
            active: activeRooms,
            newToday: roomsToday
          }
        },
        mostActiveRoom: mostActiveRoom ? {
          code: mostActiveRoom.code,
          name: mostActiveRoom.name,
          host: mostActiveRoom.host?.username,
          participants: mostActiveRoom.participants.length,
          peakParticipants: mostActiveRoom.stats.peakParticipants
        } : null,
        recentActivity: {
          users: recentUsers,
          rooms: recentRooms
        }
      }
    });
  })
);

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private/Admin
router.get(
  '/analytics',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);

    // User growth
    const userGrowth = [];
    const roomGrowth = [];
    const activityData = [];

    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const newUsers = await User.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });

      const newRooms = await Room.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });

      const activeUsers = await User.countDocuments({
        lastLogin: { $gte: startOfDay, $lt: endOfDay }
      });

      userGrowth.push({
        date: date.toISOString().split('T')[0],
        count: newUsers
      });

      roomGrowth.push({
        date: date.toISOString().split('T')[0],
        count: newRooms
      });

      activityData.push({
        date: date.toISOString().split('T')[0],
        activeUsers
      });
    }

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Top users by rooms created
    const topUsers = await User.find()
      .select('-password -loginHistory')
      .sort({ 'stats.roomsCreated': -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        userGrowth,
        roomGrowth,
        activityData,
        roleDistribution,
        topUsers
      }
    });
  })
);

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get(
  '/users',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, isBanned, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
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

// @route   GET /api/admin/rooms
// @desc    Get all rooms with pagination
// @access  Private/Admin
router.get(
  '/rooms',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const rooms = await Room.find(query)
      .populate('host', 'username email avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Room.countDocuments(query);

    res.json({
      success: true,
      data: {
        rooms: rooms.map(room => ({
          ...room.getPublicInfo(),
          host: room.host
        })),
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

// @route   DELETE /api/admin/rooms/:id
// @desc    Delete any room (admin only)
// @access  Private/Admin
router.delete(
  '/rooms/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  })
);

// @route   GET /api/admin/system
// @desc    Get system status
// @access  Private/Admin
router.get(
  '/system',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const os = require('os');

    const systemStats = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024)
      },
      cpu: os.loadavg(),
      platform: os.platform(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      data: systemStats
    });
  })
);

// @route   POST /api/admin/announcements
// @desc    Create announcement (placeholder)
// @access  Private/Admin
router.post(
  '/announcements',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { title, message, type = 'info' } = req.body;

    // TODO: Implement announcement system with database storage
    // For now, just return success

    res.json({
      success: true,
      message: 'Announcement created',
      data: {
        title,
        message,
        type,
        createdAt: new Date(),
        createdBy: req.user.username
      }
    });
  })
);

module.exports = router;
