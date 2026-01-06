const mongoose = require('mongoose');
const config = require('../config');

async function connectDatabase() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(config.mongoUri);
    console.log(`Connected to MongoDB at ${config.mongoUri}`);
  } catch (err) {
    console.error('MongoDB connection error', err);
    throw err;
  }
}

module.exports = connectDatabase;
