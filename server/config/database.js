const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
