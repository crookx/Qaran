import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const debugReviewStatsAPI = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    const productId = '680e6e7071d895e0f53b642c'; // Baby Romper ID

    // 1. Check if product exists
    const product = await Product.findById(productId);
    console.log('\nProduct in Database:');
    console.log(JSON.stringify(product, null, 2));

    // 2. Check reviews collection with detailed logging
    const reviews = await Review.find({ product: productId });
    console.log('\nReviews in Database:', reviews.length);
    
    if (reviews.length > 0) {
      console.log('\nSample Review Document:');
      console.log(JSON.stringify(reviews[0], null, 2));
      
      // Verify review schema
      console.log('\nReview Schema Fields:');
      const sampleReview = reviews[0];
      console.log('- product:', typeof sampleReview.product);
      console.log('- rating:', typeof sampleReview.rating);
      console.log('- comment:', typeof sampleReview.comment);
      console.log('- createdAt:', sampleReview.createdAt instanceof Date);
    }
    
    // 3. Calculate stats directly
    const total = reviews.length;
    const average = total > 0 
      ? Number((reviews.reduce((acc, rev) => acc + rev.rating, 0) / total).toFixed(1))
      : 0;
    
    const distribution = reviews.reduce((acc, rev) => {
      acc[rev.rating] = (acc[rev.rating] || 0) + 1;
      return acc;
    }, {});

    console.log('\nCalculated Stats:');
    console.log('- Total Reviews:', total);
    console.log('- Average Rating:', average);
    console.log('- Distribution:', distribution);

    // 4. Update product with nested reviewStats
    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      $set: {
        rating: average,
        reviewCount: total,
        reviewStats: {
          average,
          total,
          distribution
        }
      }
    }, { new: true });

    // 5. Verify the update
    console.log('\nUpdated Product Stats:');
    console.log('- Rating:', updatedProduct.rating);
    console.log('- Review Count:', updatedProduct.reviewCount);
    console.log('- Review Stats:', JSON.stringify(updatedProduct.reviewStats, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

debugReviewStatsAPI();