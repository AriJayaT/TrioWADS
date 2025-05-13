// src/config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    // Make sure we have a MONGO_URI
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is not defined in environment variables');
      console.log('Please create a .env file with MONGO_URI defined');
      process.exit(1);
    }
    
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string length: ${process.env.MONGO_URI.length}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;