import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import connectDB from '../utils/db.js';

dotenv.config();

const debugReviewSystem = async () => {
  try {
    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db');
    
    const productId = '680e6e7071d895e0f53b642c'; // Baby Romper ID
    
    console.log('\n🔍 Debugging Review System');
    
    // 1. Check Product
    const product = await Product.findById(productId);
    console.log('\n📦 Product Check:');
    console.log('Name:', product?.name);
    console.log('ID:', product?._id);
    console.log('Review Count:', product?.reviewCount);
    
    // 2. Check Reviews Direct Query
    const reviews = await Review.find({ 
      product: new mongoose.Types.ObjectId(productId) 
    });
    console.log('\n📝 Direct Review Query:');
    console.log('Reviews found:', reviews.length);
    
    if (reviews.length > 0) {
      console.log('\nSample Review:');
      console.log('- ID:', reviews[0]._id);
      console.log('- Rating:', reviews[0].rating);
      console.log('- Comment:', reviews[0].comment);
    }

    // 3. Fix Reviews if needed
    if (reviews.length > 0 && product.reviewCount !== reviews.length) {
      console.log('\n🛠️ Fixing review count mismatch...');
      
      const stats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
          rating: Number(stats[0].avgRating.toFixed(1)),
          reviewCount: stats[0].count
        });
        console.log('✅ Fixed! New review count:', stats[0].count);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

debugReviewSystem();