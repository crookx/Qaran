import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const testReviews = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const productId = '680e6e7071d895e0f53b642c'; // Baby Romper ID
    
    // Test direct MongoDB query
    const reviews = await Review.find({ product: productId });
    console.log('\nDirect query results:');
    console.log(`Found ${reviews.length} reviews for product ${productId}`);
    
    if (reviews.length > 0) {
      console.log('\nSample review:');
      console.log(JSON.stringify(reviews[0], null, 2));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testReviews();