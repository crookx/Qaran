import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const updateFeaturedProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // Select some products to be featured
    const productsToFeature = [
      'Sleep Suit',
      'Infant Sweater',
      'Baby Dress',
      'Cotton Onesie'
    ];

    // Update featured status
    const updateResults = await Promise.all(
      productsToFeature.map(name => 
        Product.findOneAndUpdate(
          { name },
          { featured: true },
          { new: true }
        )
      )
    );

    console.log('\n✅ Updated Featured Products:');
    updateResults.forEach(product => {
      if (product) {
        console.log(`- ${product.name} (${product._id})`);
      }
    });

    // Verify featured products
    const featuredProducts = await Product.find({ featured: true })
      .select('name _id featured')
      .lean();

    console.log('\n📋 Current Featured Products:');
    featuredProducts.forEach(p => {
      console.log(`- ${p.name} (${p._id})`);
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

updateFeaturedProducts();