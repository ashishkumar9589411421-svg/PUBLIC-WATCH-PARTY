const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/watchparty', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Don't exit the process, let the app continue and retry
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
