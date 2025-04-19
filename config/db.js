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
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`Connected to database: ${mongoose.connection.name}`);

  } catch (error) {
    console.error('MongoDB Connection Error Details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;