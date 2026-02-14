const Room = require('../models/Room');
const User = require('../models/User');

// Store active socket connections
const activeSockets = new Map();
const userSockets = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);
    
    activeSockets.set(socket.id, {
      socketId: socket.id,
      userId: null,
      username: null,
      roomCode: null,
      peerId: null
    });

    // ==========================================
    // ROOM MANAGEMENT
    // ==========================================

    // Join a room
    socket.on('join-room', async (data) => {
      try {
        // Defensive unpacking in case frontend sends undefined or malformed payload
        const { roomCode, userId, username, avatar, peerId } = data || {};

        if (!roomCode || typeof roomCode !== 'string') {
          socket.emit('error', { message: 'Invalid or missing roomCode' });
          console.warn(`join-room called without roomCode from socket ${socket.id}`, data);
          return;
        }

        const normalizedCode = roomCode.toString().toUpperCase();

        const room = await Room.findOne({ code: normalizedCode });
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (!room.isActive) {
          socket.emit('error', { message: 'Room has ended' });
          return;
        }

        if (room.participants.length >= room.settings.maxParticipants) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        // Join socket room using normalized code
        socket.join(normalizedCode);

        // Update socket data
        const socketData = activeSockets.get(socket.id) || {};
        socketData.userId = userId;
        socketData.username = username;
        socketData.avatar = avatar;
        socketData.roomCode = normalizedCode;
        socketData.peerId = peerId;
        activeSockets.set(socket.id, socketData);

        // Determine if user is host
        const isHost = room.host.toString() === userId;

        // Add participant to room
        await room.addParticipant({
          userId,
          socketId: socket.id,
          username,
          avatar,
          isHost,
          peerId
        });

        // Notify others in room
        socket.to(normalizedCode).emit('user-joined', {
          socketId: socket.id,
          userId,
          username,
          avatar,
          isHost,
          peerId,
          timestamp: new Date()
        });

        // Send current room state to new participant
        socket.emit('room-joined', {
          room: room.getPublicInfo(),
          participants: room.participants,
          messages: room.messages.slice(-50),
          isHost
        });

        console.log(`👤 ${username || 'Unknown user'} joined room ${normalizedCode}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave-room', async () => {
      await handleLeaveRoom(socket, io);
    });

    // ... rest of file unchanged (video sync, webrtc, helpers)

  });
};

module.exports = socketHandler;