import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const connectionString = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI 
      : process.env.MONGODB_LOCAL_URI;

    if (!connectionString) {
      throw new Error('MongoDB connection string is not defined');
    }

    console.log('Attempting MongoDB connection...');
    console.log('Environment:', process.env.NODE_ENV);
    
    const connection = await mongoose.connect(connectionString);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return connection;

  } catch (error) {
    console.error('MongoDB Connection Error Details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

export default connectDB;