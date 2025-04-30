import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (uri) => {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Test connection before exporting
if (process.env.NODE_ENV !== 'production') {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';
  console.log('Database URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//*:*@')); // Hide credentials in logs
}

export default connectDB;