import mongoose from 'mongoose';
import dotenv from 'dotenv';

const connectDB = async () => {
  try {
    const uri = 'mongodb+srv://qaranuser:DevMahnX1.@qaran-baby-shop.ed8u0jn.mongodb.net/qaran?retryWrites=true&w=majority';
    
    console.log('Attempting MongoDB connection...');
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const db = mongoose.connection;
    const collections = await db.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export default connectDB;