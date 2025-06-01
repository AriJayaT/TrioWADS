import mongoose from 'mongoose';

// MongoDB connection function
export const connectDatabase = async () => {
  try {
    // Use the exact connection string provided by the user
    const mongoURI = process.env.MONGODB_URI || 'mongodb://e2425-wads-l4acg3:pos5lpet@localhost:27018/e2425-wads-l4acg3?authSource=e2425-wads-l4acg3';
    
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string being used: ${mongoURI.replace(/:[^:]*@/, ':****@')}`); // Log connection string but hide password
    
    // Connect with connection options
    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });
    
    return connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Full error details:', error);
    
    // Don't exit the process immediately, allow retry logic
    if (process.env.NODE_ENV === 'production') {
      console.log('Will retry connection in 5 seconds...');
      setTimeout(() => connectDatabase(), 5000);
    } else {
      process.exit(1); // Exit in development for faster debugging
    }
  }
};

// Function to close database connection
export const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error(`Error closing MongoDB connection: ${error.message}`);
  }
};

// Export the mongoose instance for use in models
export default mongoose; 