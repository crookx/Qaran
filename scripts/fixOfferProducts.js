import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../models/Product.js';
import Offer from '../models/Offer.js';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const updateOfferProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get available products without price restriction
    let products = await Product.find({
      inStock: true,
      price: { $gt: 0 }  // Just ensure price is positive
    }).sort({ price: -1 }).limit(10);  // Get top 10 priced products

    if (!products.length) {
      console.log('No products found, checking all products...');
      // Fallback: try to find any products
      const allProducts = await Product.find().limit(10);
      if (!allProducts.length) {
        throw new Error('No products found in database');
      }
      products = allProducts;
    }

    console.log(`Found ${products.length} products to link with offers`);

    // Update each offer with a valid product
    const offers = await Offer.find();
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      const product = products[i % products.length];

      console.log(`Updating offer "${offer.name}" with product "${product.name}" (${product._id})`);

      await Offer.findByIdAndUpdate(offer._id, {
        productId: product._id,
        discount: Math.min(offer.discount || 25, 50),
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalQuantity: Math.min(product.stock || 50, offer.totalQuantity || 50),
        remainingQuantity: Math.min(product.stock || 50, offer.remainingQuantity || 50)
      });

      console.log(`Successfully updated offer ${offer.name}`);
    }

    console.log('All offers updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating offers:', error);
    process.exit(1);
  }
};

updateOfferProducts();