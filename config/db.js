import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Handle special characters in password
    const password = encodeURIComponent('n.#C9Fvd8TK@jcP');
    const uri = `mongodb+srv://mishaelelvis:${password}@qaran-baby-shop.ed8u0jn.mongodb.net/?retryWrites=true&w=majority&appName=Qaran-Baby-Shop`;

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

export default connectDB;