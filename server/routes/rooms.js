const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const Room = require('../models/Room');
const { auth, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post(
  '/',
  auth,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Room name is required')
      .isLength({ max: 100 })
      .withMessage('Room name cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }),
    body('isPrivate')
      .optional()
      .isBoolean(),
    body('password')
      .optional()
      .trim()
      .isLength({ min: 4, max: 50 })
      .withMessage('Password must be 4-50 characters'),
    body('maxParticipants')
      .optional()
      .isInt({ min: 2, max: 100 })
      .withMessage('Max participants must be between 2 and 100')
  ],
  asyncHandler(async (req, res) => {
    const { name, description, isPrivate, password, maxParticipants, settings } = req.body;

    // Generate unique room code
    let code;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = Room.generateCode();
      const existingRoom = await Room.findOne({ code });
      if (!existingRoom) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique room code'
      });
    }

    const room = new Room({
      code,
      name,
      description: description || '',
      host: req.userId,
      settings: {
        isPrivate: isPrivate !== undefined ? isPrivate : true,
        password: password || null,
        maxParticipants: maxParticipants || 50,
        ...settings
      }
    });

    await room.save();

    // Update user's rooms created
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      $push: { roomsCreated: room._id },
      $inc: { 'stats.roomsCreated': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: {
        room: room.getPublicInfo()
      }
    });
  })
);

// @route   GET /api/rooms
// @desc    Get all active rooms
// @access  Public
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const rooms = await Room.find(query)
      .populate('host', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Room.countDocuments(query);

    res.json({
      success: true,
      data: {
        rooms: rooms.map(room => room.getPublicInfo()),
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

// @route   GET /api/rooms/my-rooms
// @desc    Get user's rooms
// @access  Private
router.get(
  '/my-rooms',
  auth,
  asyncHandler(async (req, res) => {
    const hostedRooms = await Room.find({ host: req.userId })
      .sort({ createdAt: -1 });

    const joinedRooms = await Room.find({
      'participants.user': req.userId,
      host: { $ne: req.userId }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        hosted: hostedRooms.map(room => room.getPublicInfo()),
        joined: joinedRooms.map(room => room.getPublicInfo())
      }
    });
  })
);

// @route   GET /api/rooms/:code
// @desc    Get room by code
// @access  Public
router.get(
  '/:code',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() })
      .populate('host', 'username avatar')
      .populate('participants.user', 'username avatar');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isActive) {
      return res.status(410).json({
        success: false,
        message: 'This room has ended'
      });
    }

    res.json({
      success: true,
      data: {
        room: room.getPublicInfo()
      }
    });
  })
);

// @route   POST /api/rooms/:code/join
// @desc    Join a room
// @access  Public
router.post(
  '/:code/join',
  optionalAuth,
  [body('password').optional().trim()],
  asyncHandler(async (req, res) => {
    const { password } = req.body;

    const room = await Room.findOne({ code: req.params.code.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isActive) {
      return res.status(410).json({
        success: false,
        message: 'This room has ended'
      });
    }

    // Check password if required
    if (room.settings.password && password !== room.settings.password) {
      return res.status(403).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check if room is full
    if (room.participants.length >= room.settings.maxParticipants) {
      return res.status(403).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Update user's rooms joined
    if (req.userId) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.userId, {
        $addToSet: { roomsJoined: room._id },
        $inc: { 'stats.roomsJoined': 1 }
      });
    }

    res.json({
      success: true,
      message: 'Can join room',
      data: {
        room: room.getPublicInfo()
      }
    });
  })
);

// @route   PUT /api/rooms/:code
// @desc    Update room settings
// @access  Private (Host only)
router.put(
  '/:code',
  auth,
  asyncHandler(async (req, res) => {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isHost(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can update room settings'
      });
    }

    const allowedUpdates = [
      'name', 'description', 'videoUrl', 'settings'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'settings') {
          room.settings = { ...room.settings, ...req.body[field] };
        } else {
          room[field] = req.body[field];
        }
      }
    });

    await room.save();

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: {
        room: room.getPublicInfo()
      }
    });
  })
);

// @route   DELETE /api/rooms/:code
// @desc    End/delete a room
// @access  Private (Host only)
router.delete(
  '/:code',
  auth,
  asyncHandler(async (req, res) => {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isHost(req.userId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the host can end the room'
      });
    }

    await room.endRoom();

    res.json({
      success: true,
      message: 'Room ended successfully'
    });
  })
);

// @route   GET /api/rooms/:code/messages
// @desc    Get room messages
// @access  Private
router.get(
  '/:code/messages',
  auth,
  asyncHandler(async (req, res) => {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const { page = 1, limit = 50 } = req.query;

    const messages = room.messages
      .slice(-limit * page)
      .reverse();

    res.json({
      success: true,
      data: { messages }
    });
  })
);

// @route   GET /api/rooms/stats/overview
// @desc    Get room statistics (admin only)
// @access  Private/Admin
router.get(
  '/stats/overview',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ isActive: true });
    const endedRooms = await Room.countDocuments({ isActive: false });
    const roomsToday = await Room.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Most active room
    const mostActiveRoom = await Room.findOne()
      .sort({ 'stats.peakParticipants': -1 })
      .limit(1);

    // Room growth over last 7 days
    const roomGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const count = await Room.countDocuments({
        createdAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        }
      });
      roomGrowth.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    res.json({
      success: true,
      data: {
        totalRooms,
        activeRooms,
        endedRooms,
        roomsToday,
        mostActiveRoom: mostActiveRoom ? {
          code: mostActiveRoom.code,
          name: mostActiveRoom.name,
          peakParticipants: mostActiveRoom.stats.peakParticipants
        } : null,
        roomGrowth
      }
    });
  })
);

module.exports = router;
