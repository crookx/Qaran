import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const fixReviewSystem = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // 1. Fix review ratings - ensure they're numbers
    const reviews = await Review.find({});
    for (const review of reviews) {
      if (typeof review.rating !== 'number' || isNaN(review.rating)) {
        review.rating = parseInt(review.rating) || 0;
        await review.save();
      }
    }
    console.log(`Fixed ${reviews.length} review ratings`);

    // 2. Update all product stats
    const products = await Product.find({});
    for (const product of products) {
      const productReviews = await Review.find({ product: product._id });
      
      // Calculate review stats
      const total = productReviews.length;
      const average = total > 0 
        ? Number((productReviews.reduce((acc, rev) => acc + rev.rating, 0) / total).toFixed(1))
        : 0;
      
      const distribution = productReviews.reduce((acc, rev) => {
        acc[rev.rating] = (acc[rev.rating] || 0) + 1;
        return acc;
      }, {});

      // Update only review-related fields
      const updateData = {
        rating: average,
        reviewCount: total,
        reviewStats: {
          average,
          total,
          distribution
        }
      };

      // Use updateOne to avoid validation of other fields
      await Product.updateOne(
        { _id: product._id },
        { $set: updateData },
        { runValidators: false }
      );

      console.log(`Updated stats for ${product.name}: ${average} (${total} reviews)`);
    }

    console.log('\nFix completed successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

fixReviewSystem();