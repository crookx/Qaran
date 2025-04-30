import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import connectDB from '../utils/db.js';

dotenv.config();

const verifyReviews = async () => {
  try {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db');
    
    const productId = '680e6e7071d895e0f53b642c';
    
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log('\n📦 Product Details:');
    console.log('Name:', product.name);
    console.log('Rating:', product.rating);
    console.log('Review Count:', product.reviewCount);

    // Get all reviews without population first
    const reviews = await Review.find({ product: productId }).sort('-createdAt');

    console.log('\n📝 Reviews Found:', reviews.length);
    
    if (reviews.length === 0) {
      console.log('Creating sample reviews...');
      
      // Create a test user if none exists
      let testUser = await User.findOne({ email: 'test@example.com' });
      if (!testUser) {
        testUser = await User.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        });
      }

      const sampleReviews = [
        {
          rating: 5,
          comment: "Absolutely love this! Perfect for our baby.",
          helpful: 12
        },
        {
          rating: 4,
          comment: "Great quality, minor improvements possible.",
          helpful: 8
        },
        {
          rating: 3,
          comment: "Decent product but a bit pricey.",
          helpful: 5
        }
      ];

      for (const sample of sampleReviews) {
        const review = new Review({
          product: productId,
          user: testUser._id,
          ...sample,
          verifiedPurchase: true,
          createdAt: new Date()
        });
        await review.save();
      }
      
      console.log('✅ Created sample reviews');

      // Update product rating
      const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            numReviews: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
          rating: Number(stats[0].avgRating.toFixed(1)),
          reviewCount: stats[0].numReviews
        });
      }

    } else {
      console.log('\nExisting Reviews:');
      for (const review of reviews) {
        console.log(`- Rating: ${review.rating}, Helpful: ${review.helpful}`);
        console.log(`  Comment: ${review.comment}`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete');
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

verifyReviews();