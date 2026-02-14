const mongoose = require('mongoose');

let isConnected = false;

const buildUriFromEnv = () => {
  const envUri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();
  if (envUri) return envUri;

  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS || '';
  const host = process.env.MONGO_HOST; // e.g. cluster0.xyz.mongodb.net
  const db = process.env.MONGO_DB || 'admin';
  const options = process.env.MONGO_OPTIONS || 'retryWrites=true&w=majority';

  if (!user || !host) return null;

  const encodedPass = encodeURIComponent(pass);
  return `mongodb+srv://${user}:${encodedPass}@${host}/${db}?${options}`;
};

const maskUri = (uri) => {
  try {
    return uri.replace(/:\/\/\/([^:]+):([^@]+)@/, '://$1:*****@');
  } catch (e) {
    return '***masked-uri***';
  }
};

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const uri = buildUriFromEnv();

  if (!uri) {
    console.error('MongoDB connection information missing. Set MONGODB_URI or MONGO_USER & MONGO_HOST environment variables.');
    // retry after delay to allow envs to be populated (useful in some deploys)
    setTimeout(connectDB, 5000);
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message || error);
    console.error('Attempted URI (masked):', maskUri(uri));
    // Wait and retry
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;