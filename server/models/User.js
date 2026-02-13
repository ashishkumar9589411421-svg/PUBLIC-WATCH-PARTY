const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  bannedUntil: {
    type: Date,
    default: null
  },
  roomsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  roomsJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    location: String
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'auto'],
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    soundEffects: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalWatchTime: { type: Number, default: 0 }, // in minutes
    roomsCreated: { type: Number, default: 0 },
    roomsJoined: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function(ip, userAgent, location) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    ip,
    userAgent,
    location,
    timestamp: new Date()
  });
  // Keep only last 10 login records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
  return this.save();
};

// Check if user is banned
userSchema.methods.isUserBanned = function() {
  if (!this.isBanned) return false;
  if (this.bannedUntil && this.bannedUntil < new Date()) {
    this.isBanned = false;
    this.banReason = null;
    this.bannedUntil = null;
    this.save();
    return false;
  }
  return true;
};

// Ban user
userSchema.methods.ban = function(reason, duration = null) {
  this.isBanned = true;
  this.banReason = reason;
  if (duration) {
    this.bannedUntil = new Date(Date.now() + duration);
  }
  return this.save();
};

// Unban user
userSchema.methods.unban = function() {
  this.isBanned = false;
  this.banReason = null;
  this.bannedUntil = null;
  return this.save();
};

// Update stats
userSchema.methods.updateStats = function(field, value) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += value;
    return this.save();
  }
};

// Virtual for user profile (public)
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    username: this.username,
    avatar: this.avatar,
    role: this.role,
    createdAt: this.createdAt,
    stats: this.stats
  };
});

module.exports = mongoose.model('User', userSchema);
