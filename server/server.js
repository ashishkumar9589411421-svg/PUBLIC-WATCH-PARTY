const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/admin');
const socketHandler = require('./socket/socketHandler');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

// ========================
// 🔐 SECURITY (Helmet)
// ========================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Prevents CSP blocking YouTube & frontend
}));

// ========================
// 🌍 CORS (FINAL FIX - PRODUCTION SAFE)
// ========================
app.use(cors({
  origin: true, // Allow all origins (safe for now)
  credentials: true
}));

// ========================
// 🚦 RATE LIMITING
// ========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ========================
// 📦 BODY PARSER
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// 🗄️ DATABASE
// ========================
connectDB();

// ========================
// 📡 API ROUTES
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);

// ========================
// ❤️ HEALTH CHECK
// ========================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'WatchParty API Server',
    version: '1.0.0',
    status: 'running',
  });
});

// ========================
// 🔌 SOCKET.IO
// ========================
const io = socketIo(server, {
  cors: {
    origin: true,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

socketHandler(io);

// ========================
// ❌ ERROR HANDLING
// ========================
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ========================
// 🚀 START SERVER
// ========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS: Open (All origins allowed)`);
});

module.exports = { app, server, io };
