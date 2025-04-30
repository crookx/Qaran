import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const checkReviewStats = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const productId = '680e6e7071d895e0f53b642e'; // Sleep Suit ID

    // Check Product Stats
    const product = await Product.findById(productId).lean();
    console.log('\nProduct Stats from Product Collection:');
    console.log('- Rating:', product.rating);
    console.log('- Review Count:', product.reviewCount);
    console.log('- Distribution:', product.ratingDistribution || {});

    // Check Reviews Directly
    const reviews = await Review.find({ product: productId });
    console.log('\nDirect Review Count:', reviews.length);
    
    if (reviews.length > 0) {
      const distribution = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});
      
      const average = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
      
      console.log('Calculated from Reviews:');
      console.log('- Average Rating:', average.toFixed(1));
      console.log('- Distribution:', distribution);
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

checkReviewStats();