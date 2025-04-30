import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const checkReviewCollection = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const productId = '680e6e7071d895e0f53b642c'; // Baby Romper ID

    // Check raw collection data
    const db = mongoose.connection.db;
    const reviewsCollection = db.collection('reviews');
    
    console.log('\nChecking raw reviews collection:');
    const rawReviews = await reviewsCollection.find({ product: new mongoose.Types.ObjectId(productId) }).toArray();
    console.log('Raw reviews count:', rawReviews.length);
    
    if (rawReviews.length > 0) {
      console.log('\nSample raw review:');
      console.log(JSON.stringify(rawReviews[0], null, 2));
    }

    // Check using Mongoose Model
    console.log('\nChecking through Mongoose Model:');
    const modelReviews = await Review.find({ product: productId });
    console.log('Model reviews count:', modelReviews.length);

    if (modelReviews.length > 0) {
      console.log('\nSample model review:');
      console.log(JSON.stringify(modelReviews[0].toJSON(), null, 2));
    }

    // Check review schema
    console.log('\nReview Schema:');
    console.log(Review.schema.paths);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

checkReviewCollection();