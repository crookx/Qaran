const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'return'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  reference: {
    type: String
  },
  notes: String,
  cost: Number
});

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant'
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  transactions: [inventoryTransactionSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);