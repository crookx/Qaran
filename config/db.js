import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    const isDev = process.env.NODE_ENV === 'development';
    const connectionString = isDev ? process.env.MONGODB_LOCAL_URI : process.env.MONGODB_URI;

    if (!connectionString) {
      throw new Error(`MongoDB connection string missing for ${process.env.NODE_ENV} environment. Please check your .env file.`);
    }

    const connection = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${connection.connection.host} (${process.env.NODE_ENV} mode)`);
    return connection;

  } catch (error) {
    console.error('MongoDB Connection Error Details:', error);
    throw error;
  }
};

export default connectDB;