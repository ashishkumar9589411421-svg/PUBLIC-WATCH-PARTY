const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  socketId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  isHost: {
    type: Boolean,
    default: false
  },
  isCoHost: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isVideoOn: {
    type: Boolean,
    default: false
  },
  isScreenSharing: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  peerId: {
    type: String,
    default: null
  }
});

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'system', 'emoji', 'gif'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
});

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  messages: [messageSchema],
  videoUrl: {
    type: String,
    default: null
  },
  videoState: {
    isPlaying: {
      type: Boolean,
      default: false
    },
    currentTime: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    playbackRate: {
      type: Number,
      default: 1
    },
    volume: {
      type: Number,
      default: 1
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  settings: {
    isPrivate: {
      type: Boolean,
      default: true
    },
    password: {
      type: String,
      default: null,
      select: false
    },
    maxParticipants: {
      type: Number,
      default: 50,
      min: 2,
      max: 100
    },
    allowChat: {
      type: Boolean,
      default: true
    },
    allowVideo: {
      type: Boolean,
      default: true
    },
    allowVoice: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    hostOnlyControls: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  endedAt: {
    type: Date,
    default: null
  },
  stats: {
    peakParticipants: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    totalWatchTime: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
roomSchema.index({ code: 1 });
roomSchema.index({ host: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ 'participants.user': 1 });

// Generate unique room code
roomSchema.statics.generateCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Find room by code
roomSchema.statics.findByCode = async function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

// Add participant
roomSchema.methods.addParticipant = async function(userData) {
  const existingIndex = this.participants.findIndex(
    p => p.user?.toString() === userData.userId || p.socketId === userData.socketId
  );
  
  if (existingIndex >= 0) {
    // Update existing participant
    this.participants[existingIndex].socketId = userData.socketId;
    this.participants[existingIndex].peerId = userData.peerId;
  } else {
    // Add new participant
    this.participants.push({
      user: userData.userId,
      socketId: userData.socketId,
      username: userData.username,
      avatar: userData.avatar,
      isHost: userData.isHost || false,
      isCoHost: userData.isCoHost || false,
      peerId: userData.peerId
    });
  }
  
  // Update peak participants
  if (this.participants.length > this.stats.peakParticipants) {
    this.stats.peakParticipants = this.participants.length;
  }
  
  return this.save();
};

// Remove participant
roomSchema.methods.removeParticipant = async function(socketId) {
  this.participants = this.participants.filter(p => p.socketId !== socketId);
  return this.save();
};

// Add message
roomSchema.methods.addMessage = async function(messageData) {
  this.messages.push(messageData);
  this.stats.totalMessages += 1;
  
  // Keep only last 100 messages
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
  
  return this.save();
};

// Update video state
roomSchema.methods.updateVideoState = async function(state) {
  this.videoState = {
    ...this.videoState,
    ...state,
    lastUpdated: new Date()
  };
  return this.save();
};

// Set video URL
roomSchema.methods.setVideo = async function(url) {
  this.videoUrl = url;
  this.videoState = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 1,
    isMuted: false,
    lastUpdated: new Date()
  };
  return this.save();
};

// End room
roomSchema.methods.endRoom = async function() {
  this.isActive = false;
  this.endedAt = new Date();
  this.participants = [];
  return this.save();
};

// Check if user is host
roomSchema.methods.isHost = function(userId) {
  return this.host.toString() === userId.toString();
};

// Check if user can control playback
roomSchema.methods.canControl = function(userId) {
  if (!this.settings.hostOnlyControls) return true;
  
  const participant = this.participants.find(
    p => p.user?.toString() === userId.toString()
  );
  
  return this.isHost(userId) || participant?.isCoHost;
};

// Kick participant
roomSchema.methods.kickParticipant = async function(socketId) {
  this.participants = this.participants.filter(p => p.socketId !== socketId);
  return this.save();
};

// Make co-host
roomSchema.methods.makeCoHost = async function(userId) {
  const participant = this.participants.find(
    p => p.user?.toString() === userId.toString()
  );
  if (participant) {
    participant.isCoHost = true;
    return this.save();
  }
  throw new Error('Participant not found');
};

// Remove co-host
roomSchema.methods.removeCoHost = async function(userId) {
  const participant = this.participants.find(
    p => p.user?.toString() === userId.toString()
  );
  if (participant) {
    participant.isCoHost = false;
    return this.save();
  }
  throw new Error('Participant not found');
};

// Verify password
roomSchema.methods.verifyPassword = async function(password) {
  if (!this.settings.password) return true;
  return password === this.settings.password;
};

// Get public info
roomSchema.methods.getPublicInfo = function() {
  return {
    code: this.code,
    name: this.name,
    description: this.description,
    host: this.host,
    participantCount: this.participants.length,
    maxParticipants: this.settings.maxParticipants,
    isPrivate: this.settings.isPrivate,
    videoUrl: this.videoUrl,
    videoState: this.videoState,
    settings: {
      allowChat: this.settings.allowChat,
      allowVideo: this.settings.allowVideo,
      allowVoice: this.settings.allowVoice,
      allowScreenShare: this.settings.allowScreenShare,
      hostOnlyControls: this.settings.hostOnlyControls
    },
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Room', roomSchema);
