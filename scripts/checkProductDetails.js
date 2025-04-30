import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Question from '../models/Question.js';
import Category from '../models/Category.js';
import User from '../models/User.js'; // Add User model import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const checkProductDetails = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // Find the Baby Romper product (we know this exists)
    const product = await Product.findOne({ slug: 'baby-romper-clothing' });
    
    if (!product) {
      console.log('❌ Product not found');
      return;
    }

    console.log('\n📦 Product Details:');
    console.log('MongoDB ID:', product._id.toString());
    console.log('Name:', product.name);
    console.log('Slug:', product.slug);
    console.log('Rating:', product.rating);
    console.log('Review Count:', product.reviewCount);

    console.log('\n🚀 Test Commands (copy & paste these):');
    console.log('\n# Reviews');
    console.log(`curl -X GET "http://localhost:8080/api/reviews/product/${product._id}?sort=newest&rating=all&page=1&limit=10"`);
    
    console.log('\n# Review Stats');
    console.log(`curl -X GET "http://localhost:8080/api/reviews/stats/${product._id}"`);
    
    console.log('\n# Q&A');
    console.log(`curl -X GET "http://localhost:8080/api/questions/product/${product._id}?sort=newest&page=1"`);

    // Create a sample review if none exist
    const reviewCount = await Review.countDocuments({ product: product._id });
    if (reviewCount === 0) {
      console.log('\n📝 Creating sample review...');
      const review = new Review({
        product: product._id,
        user: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: "Absolutely love this! Perfect for our baby.",
        verifiedPurchase: true,
        helpful: 0,
        createdAt: new Date()
      });
      await review.save();
      console.log('✅ Sample review created!');
    }

    // Create a sample question if none exist
    const questionCount = await Question.countDocuments({ product: product._id });
    if (questionCount === 0) {
      console.log('\n❓ Creating sample question...');
      const question = new Question({
        product: product._id,
        user: new mongoose.Types.ObjectId(),
        question: "What age is this suitable for?",
        answers: [{
          user: new mongoose.Types.ObjectId(),
          answer: "Based on my experience, it's perfect for babies 6-12 months old.",
          helpful: 0,
          createdAt: new Date()
        }],
        helpful: 0,
        createdAt: new Date()
      });
      await question.save();
      console.log('✅ Sample question created!');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

checkProductDetails();