import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = 'mongodb+srv://qaranuser:DevMahnX1.@qaran-baby-shop.ed8u0jn.mongodb.net/?retryWrites=true&w=majority&appName=Qaran-Baby-Shop';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    console.log('Attempting MongoDB connection...');
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    process.exit(1);
  }
};

export default connectDB;