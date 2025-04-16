import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for time left
offerSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  
  if (diff <= 0) return '0d 0h';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
});

// Virtual field for active status
offerSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;