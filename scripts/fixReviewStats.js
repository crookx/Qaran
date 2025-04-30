import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const fixReviewStats = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // Get all products with reviews
    const products = await Product.find();
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      // Get all reviews for this product
      const reviews = await Review.find({ product: product._id });
      
      if (reviews.length > 0) {
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        // Calculate rating distribution
        const distribution = reviews.reduce((acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        }, {});

        // Update product with new stats
        await Product.findByIdAndUpdate(product._id, {
          rating: Number(averageRating.toFixed(1)),
          reviewCount: reviews.length,
          ratingDistribution: distribution
        });

        console.log(`\nUpdated stats for ${product.name} (${product._id}):`);
        console.log('- Average Rating:', averageRating.toFixed(1));
        console.log('- Review Count:', reviews.length);
        console.log('- Distribution:', distribution);
      } else {
        // Reset stats if no reviews
        await Product.findByIdAndUpdate(product._id, {
          rating: 0,
          reviewCount: 0,
          ratingDistribution: {}
        });
        console.log(`\nReset stats for ${product.name} (no reviews)`);
      }
    }

    console.log('\nAll review statistics have been updated!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

fixReviewStats();