import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const verifyReviewStatsEndpoint = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const productId = '680e6e7071d895e0f53b642e'; // Sleep Suit ID

    // Get product and reviews
    const [product, reviews] = await Promise.all([
      Product.findById(productId).lean(),
      Review.find({ product: productId }).lean()
    ]);

    console.log('\nProduct from Database:');
    console.log(JSON.stringify(product, null, 2));

    console.log('\nReviews Stats:');
    if (reviews.length > 0) {
      const distribution = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});
      
      const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
      
      console.log({
        average: Number(average.toFixed(1)),
        total: reviews.length,
        distribution
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

verifyReviewStatsEndpoint();