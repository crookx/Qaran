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

const migrateOffers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const offers = await Offer.find();
    console.log(`Found ${offers.length} offers to migrate`);
    
    for (const offer of offers) {
      // Skip already migrated offers
      if (offer.productId instanceof mongoose.Types.ObjectId) {
        console.log(`Offer ${offer._id} already migrated`);
        continue;
      }

      // Find product by string ID or name
      const product = await Product.findOne({
        $or: [
          { _id: offer.productId },
          { name: offer.productName }
        ]
      });

      if (!product) {
        console.log(`No product found for offer: ${offer._id}`);
        continue;
      }

      // Update offer with standardized structure
      await Offer.findByIdAndUpdate(offer._id, {
        productId: product._id,
        name: offer.name || 'Special Offer',
        discount: offer.discount,
        startDate: offer.startDate || offer.createdAt || new Date(),
        endDate: offer.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalQuantity: offer.totalQuantity || offer.total || 50,
        remainingQuantity: offer.remainingQuantity || offer.remaining || 50
      });

      console.log(`Migrated offer: ${offer._id}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateOffers();