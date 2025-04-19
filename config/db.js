import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const connectionString = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI 
      : process.env.MONGODB_LOCAL_URI;

    if (!connectionString) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }

    console.log('Attempting MongoDB connection...');
    
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;