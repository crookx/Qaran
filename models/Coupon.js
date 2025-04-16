import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Coupon description is required']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  minimumPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase amount cannot be negative']
  },
  maxUses: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  }
}, {
  timestamps: true
});

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiryDate;
});

// Virtual for checking if coupon has reached max uses
couponSchema.virtual('isMaxedOut').get(function() {
  return this.maxUses ? this.usedCount >= this.maxUses : false;
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;