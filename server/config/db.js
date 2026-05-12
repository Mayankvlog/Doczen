const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MongoDB URI not found. Check .env file has MONGO_URI set.');
    console.log('Server will continue without database. PDF tools will work without user features.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('Server will continue without database. PDF tools will work without user features.');
  }
};

module.exports = connectDB;
