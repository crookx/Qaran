import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Inventory from '../models/Inventory.js';
import InventoryHistory from '../models/InventoryHistory.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qaran_db';

const updateStockLevels = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Get system user
    const systemUser = await User.findOne({ email: 'system@qaran.com' });
    if (!systemUser) {
      throw new Error('System user not found. Please run createSystemUser.js first');
    }

    // Get all variants
    const variants = await Variant.find().populate('product');
    console.log(`Found ${variants.length} variants`);

    for (const variant of variants) {
      // Get current inventory
      let inventory = await Inventory.findOne({ variant: variant._id });
      
      if (!inventory) {
        // Create new inventory if doesn't exist
        inventory = new Inventory({
          product: variant.product._id,
          variant: variant._id,
          currentStock: variant.stock,
          lowStockThreshold: 5,
          transactions: [{
            type: 'initial',
            quantity: variant.stock,
            date: new Date(),
            reference: 'System Initialize'
          }]
        });
      }

      // Update variant stock
      variant.stock = inventory.currentStock;
      await variant.save();

      // Update product total stock
      const productVariants = await Variant.find({ product: variant.product._id });
      const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0);
      
      await Product.findByIdAndUpdate(variant.product._id, {
        stock: totalStock,
        inStock: totalStock > 0
      });

      // Create history record
      await InventoryHistory.create({
        product: variant.product._id,
        variant: variant._id,
        type: 'adjustment',
        quantity: variant.stock,
        oldStock: inventory.currentStock,
        newStock: variant.stock,
        reason: 'Stock Sync',
        updatedBy: systemUser._id
      });

      await inventory.save();
    }

    console.log('Successfully updated all inventory levels');
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error updating inventory:', error);
    process.exit(1);
  }
};

updateStockLevels();