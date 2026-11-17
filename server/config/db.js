const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('No MONGO_URI set — running in in-memory mode (data resets on restart).');
    return false;
  }
  try {
    // Fail fast so the app falls back to in-memory mode instead of leaving
    // the frontend waiting ~30s for a MongoDB that may not be running.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    isConnected = true;
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.warn('MongoDB connection failed, falling back to in-memory mode:', err.message);
    return false;
  }
}

function dbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, dbConnected };
