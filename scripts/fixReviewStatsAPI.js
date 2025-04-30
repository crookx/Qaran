import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const fixReviewStatsAPI = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const productId = '680e6e7071d895e0f53b642e'; // Sleep Suit ID
    const reviews = await Review.find({ product: productId });

    // Calculate stats
    const total = reviews.length;
    const average = total > 0 
      ? Number((reviews.reduce((acc, rev) => acc + rev.rating, 0) / total).toFixed(1))
      : 0;
    
    // Calculate distribution
    const distribution = reviews.reduce((acc, rev) => {
      acc[rev.rating] = (acc[rev.rating] || 0) + 1;
      return acc;
    }, {});

    // Update product stats with matching field names
    await Product.findByIdAndUpdate(productId, {
      $set: {
        rating: average,
        reviewCount: total,
        ratingDistribution: distribution,
        // Add API-specific fields
        reviewStats: {
          average,
          total,
          distribution
        }
      }
    });

    console.log('\nUpdated Review Stats:');
    console.log({
      average,
      total,
      distribution
    });

    // Verify update
    const updatedProduct = await Product.findById(productId);
    console.log('\nVerified Product Stats:');
    console.log({
      rating: updatedProduct.rating,
      reviewCount: updatedProduct.reviewCount,
      distribution: updatedProduct.ratingDistribution,
      reviewStats: updatedProduct.reviewStats
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

fixReviewStatsAPI();