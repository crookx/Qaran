import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

class InventoryService {
  static async updateStock(productId, variantId, quantity, type, reference) {
    const query = { product: productId };
    if (variantId) query.variant = variantId;

    let inventory = await Inventory.findOne(query);
    if (!inventory) {
      inventory = new Inventory({
        product: productId,
        variant: variantId,
        currentStock: 0
      });
    }

    const transaction = {
      type,
      quantity,
      reference,
      date: new Date()
    };

    inventory.transactions.push(transaction);
    inventory.currentStock += type === 'purchase' ? quantity : -quantity;
    inventory.lastUpdated = new Date();

    await inventory.save();

    if (variantId) {
      await Variant.findByIdAndUpdate(variantId, {
        stock: inventory.currentStock
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        stock: inventory.currentStock
      });
    }

    return inventory;
  }

  static async checkLowStock() {
    return await Inventory.find({
      currentStock: { $lte: '$lowStockThreshold' }
    }).populate('product variant');
  }

  static async getInventoryHistory(productId, variantId, startDate, endDate) {
    const query = { product: productId };
    if (variantId) query.variant = variantId;
    if (startDate || endDate) {
      query['transactions.date'] = {};
      if (startDate) query['transactions.date'].$gte = new Date(startDate);
      if (endDate) query['transactions.date'].$lte = new Date(endDate);
    }

    return await Inventory.findOne(query)
      .populate('product variant')
      .sort({ 'transactions.date': -1 });
  }
}

class StockService {
  static async updateStock(productId, quantity) {
    await redis.set(`stock:${productId}`, quantity);
    await redis.publish('stockUpdates', JSON.stringify({
      productId,
      quantity
    }));
  }

  static async getStock(productId) {
    return await redis.get(`stock:${productId}`);
  }
}

export { InventoryService, StockService };