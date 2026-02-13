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
        const { roomCode, userId, username, avatar, peerId } = data;
        
        const room = await Room.findOne({ code: roomCode.toUpperCase() });
        
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

        // Join socket room
        socket.join(roomCode.toUpperCase());

        // Update socket data
        const socketData = activeSockets.get(socket.id);
        socketData.userId = userId;
        socketData.username = username;
        socketData.avatar = avatar;
        socketData.roomCode = roomCode.toUpperCase();
        socketData.peerId = peerId;

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
        socket.to(roomCode.toUpperCase()).emit('user-joined', {
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

        console.log(`👤 ${username} joined room ${roomCode}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave-room', async () => {
      await handleLeaveRoom(socket, io);
    });

    // ==========================================
    // VIDEO SYNC
    // ==========================================

    // Update video state (play/pause/seek)
    socket.on('video-state-change', async (data) => {
      try {
        const { roomCode, state, userId } = data;
        const room = await Room.findOne({ code: roomCode.toUpperCase() });

        if (!room) return;

        // Check if user can control playback
        if (!room.canControl(userId)) {
          socket.emit('error', { message: 'Only host can control playback' });
          return;
        }

        // Update room video state
        await room.updateVideoState(state);

        // Broadcast to all in room except sender
        socket.to(roomCode.toUpperCase()).emit('video-state-updated', {
          state,
          updatedBy: userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Video state change error:', error);
      }
    });

    // Change video
    socket.on('change-video', async (data) => {
      try {
        const { roomCode, videoUrl, userId } = data;
        const room = await Room.findOne({ code: roomCode.toUpperCase() });

        if (!room) return;

        // Check if user can control
        if (!room.canControl(userId)) {
          socket.emit('error', { message: 'Only host can change video' });
          return;
        }

        // Update video
        await room.setVideo(videoUrl);

        // Broadcast to all in room
        io.to(roomCode.toUpperCase()).emit('video-changed', {
          videoUrl,
          changedBy: userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Change video error:', error);
      }
    });

    // Request sync (for late joiners)
    socket.on('request-sync', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ code: roomCode.toUpperCase() });

        if (!room) return;

        socket.emit('sync-data', {
          videoState: room.videoState,
          videoUrl: room.videoUrl
        });
      } catch (error) {
        console.error('Request sync error:', error);
      }
    });

    // ==========================================
    // CHAT
    // ==========================================

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { roomCode, message, type = 'text' } = data;
        const socketData = activeSockets.get(socket.id);

        if (!socketData.roomCode) return;

        const room = await Room.findOne({ code: roomCode.toUpperCase() });
        if (!room || !room.settings.allowChat) return;

        const messageData = {
          user: socketData.userId,
          username: socketData.username,
          avatar: socketData.avatar,
          message,
          type,
          timestamp: new Date()
        };

        // Save message
        await room.addMessage(messageData);

        // Broadcast to all in room
        io.to(roomCode.toUpperCase()).emit('new-message', messageData);

        // Update user stats
        if (socketData.userId) {
          await User.findByIdAndUpdate(socketData.userId, {
            $inc: { 'stats.messagesSent': 1 }
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { roomCode, isTyping } = data;
      const socketData = activeSockets.get(socket.id);
      
      socket.to(roomCode.toUpperCase()).emit('user-typing', {
        username: socketData.username,
        isTyping
      });
    });

    // ==========================================
    // WEBRTC SIGNALING
    // ==========================================

    // WebRTC offer
    socket.on('webrtc-offer', (data) => {
      const { targetSocketId, offer } = data;
      socket.to(targetSocketId).emit('webrtc-offer', {
        offer,
        fromSocketId: socket.id,
        fromPeerId: activeSockets.get(socket.id)?.peerId
      });
    });

    // WebRTC answer
    socket.on('webrtc-answer', (data) => {
      const { targetSocketId, answer } = data;
      socket.to(targetSocketId).emit('webrtc-answer', {
        answer,
        fromSocketId: socket.id
      });
    });

    // WebRTC ICE candidate
    socket.on('webrtc-ice-candidate', (data) => {
      const { targetSocketId, candidate } = data;
      socket.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidate,
        fromSocketId: socket.id
      });
    });

    // Join video call
    socket.on('join-video-call', (data) => {
      const { roomCode, peerId } = data;
      const socketData = activeSockets.get(socket.id);
      
      if (socketData) {
        socketData.peerId = peerId;
        socketData.isVideoOn = true;
      }

      socket.to(roomCode.toUpperCase()).emit('user-joined-video', {
        socketId: socket.id,
        peerId,
        username: socketData?.username
      });
    });

    // Leave video call
    socket.on('leave-video-call', (data) => {
      const { roomCode } = data;
      const socketData = activeSockets.get(socket.id);
      
      if (socketData) {
        socketData.isVideoOn = false;
      }

      socket.to(roomCode.toUpperCase()).emit('user-left-video', {
        socketId: socket.id,
        peerId: socketData?.peerId
      });
    });

    // Toggle video
    socket.on('toggle-video', (data) => {
      const { roomCode, isVideoOn } = data;
      const socketData = activeSockets.get(socket.id);
      
      if (socketData) {
        socketData.isVideoOn = isVideoOn;
      }

      socket.to(roomCode.toUpperCase()).emit('user-toggled-video', {
        socketId: socket.id,
        isVideoOn
      });
    });

    // Toggle audio
    socket.on('toggle-audio', (data) => {
      const { roomCode, isMuted } = data;
      const socketData = activeSockets.get(socket.id);
      
      if (socketData) {
        socketData.isMuted = isMuted;
      }

      socket.to(roomCode.toUpperCase()).emit('user-toggled-audio', {
        socketId: socket.id,
        isMuted
      });
    });

    // Screen share
    socket.on('screen-share', (data) => {
      const { roomCode, isScreenSharing } = data;
      const socketData = activeSockets.get(socket.id);
      
      if (socketData) {
        socketData.isScreenSharing = isScreenSharing;
      }

      socket.to(roomCode.toUpperCase()).emit('user-screen-share', {
        socketId: socket.id,
        isScreenSharing,
        peerId: socketData?.peerId
      });
    });

    // ==========================================
    // ROOM CONTROLS
    // ==========================================

    // Kick user (host only)
    socket.on('kick-user', async (data) => {
      try {
        const { roomCode, targetSocketId, userId } = data;
        const room = await Room.findOne({ code: roomCode.toUpperCase() });

        if (!room) return;

        // Verify host
        if (!room.isHost(userId)) {
          socket.emit('error', { message: 'Only host can kick users' });
          return;
        }

        // Kick user
        await room.kickParticipant(targetSocketId);

        // Notify kicked user
        io.to(targetSocketId).emit('kicked', {
          message: 'You have been removed from the room'
        });

        // Disconnect kicked user from room
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.leave(roomCode.toUpperCase());
        }

        // Notify others
        io.to(roomCode.toUpperCase()).emit('user-kicked', {
          socketId: targetSocketId
        });
      } catch (error) {
        console.error('Kick user error:', error);
      }
    });

    // Make co-host (host only)
    socket.on('make-cohost', async (data) => {
      try {
        const { roomCode, targetUserId, userId } = data;
        const room = await Room.findOne({ code: roomCode.toUpperCase() });

        if (!room) return;

        if (!room.isHost(userId)) {
          socket.emit('error', { message: 'Only host can assign co-hosts' });
          return;
        }

        await room.makeCoHost(targetUserId);

        io.to(roomCode.toUpperCase()).emit('cohost-assigned', {
          userId: targetUserId
        });
      } catch (error) {
        console.error('Make cohost error:', error);
      }
    });

    // Update room settings (host only)
    socket.on('update-room-settings', async (data) => {
      try {
        const { roomCode, settings, userId } = data;
        const room = await Room.findOne({ code: roomCode.toUpperCase() });

        if (!room) return;

        if (!room.isHost(userId)) {
          socket.emit('error', { message: 'Only host can update settings' });
          return;
        }

        room.settings = { ...room.settings, ...settings };
        await room.save();

        io.to(roomCode.toUpperCase()).emit('room-settings-updated', {
          settings: room.settings
        });
      } catch (error) {
        console.error('Update settings error:', error);
      }
    });

    // ==========================================
    // REACTIONS
    // ==========================================

    // Send reaction
    socket.on('send-reaction', (data) => {
      const { roomCode, emoji } = data;
      const socketData = activeSockets.get(socket.id);

      socket.to(roomCode.toUpperCase()).emit('reaction', {
        emoji,
        username: socketData?.username,
        timestamp: new Date()
      });
    });

    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on('disconnect', async () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
      await handleLeaveRoom(socket, io);
      activeSockets.delete(socket.id);
    });
  });

  // Helper function to handle leaving room
  async function handleLeaveRoom(socket, io) {
    const socketData = activeSockets.get(socket.id);
    
    if (!socketData || !socketData.roomCode) return;

    try {
      const room = await Room.findOne({ code: socketData.roomCode });
      
      if (room) {
        await room.removeParticipant(socket.id);

        // Notify others
        socket.to(socketData.roomCode).emit('user-left', {
          socketId: socket.id,
          username: socketData.username,
          timestamp: new Date()
        });

        // Leave socket room
        socket.leave(socketData.roomCode);

        console.log(`👤 ${socketData.username} left room ${socketData.roomCode}`);
      }

      socketData.roomCode = null;
    } catch (error) {
      console.error('Leave room error:', error);
    }
  }
};

module.exports = socketHandler;
