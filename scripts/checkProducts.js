import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const checkProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Get all products
    const products = await Product.find().select('_id name');
    
    console.log('\nProducts in database:');
    products.forEach(p => {
      console.log(`${p.name}: ${p._id}`);
    });
    
    // Also check reviews for each product
    for (const product of products) {
      const reviewCount = await Review.countDocuments({ product: product._id });
      console.log(`Reviews for ${product.name}: ${reviewCount}`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkProducts();