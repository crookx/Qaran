import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema]
}, { timestamps: true });

// Pre-save middleware to ensure user and items are set
cartSchema.pre('save', function(next) {
  if (!this.user) {
    next(new Error('Cart must have a user'));
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;