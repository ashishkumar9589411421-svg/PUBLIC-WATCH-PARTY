const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is valid but user no longer exists' });
    }

    if (user.isUserBanned()) {
      return res.status(403).json({ 
        message: 'Your account has been banned',
        reason: user.banReason,
        bannedUntil: user.bannedUntil
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Optional auth (for guest access)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && !user.isUserBanned()) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

// Admin only
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Moderator or Admin
const moderatorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Moderator or Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = {
  auth,
  optionalAuth,
  adminOnly,
  moderatorOrAdmin,
  generateToken
};
