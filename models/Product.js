import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    index: true // Added for better query performance
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  ageGroup: {
    type: String,
    required: true,
    enum: {
      values: ["0-3 months", "3-6 months", "6-12 months", "12-24 months", "24+ months", "all ages"],
      message: '{VALUE} is not a valid age group'
    },
    index: true
  },
  colors: [{
    type: String,
    trim: true
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  metadata: {
    dimensions: {
      width: Number,
      height: Number,
      depth: Number
    },
    weight: Number,
    manufacturer: String,
    origin: String,
    warranty: String
  },
  tags: [String],
  features: [String],
  safetyInfo: String,
  washingInstructions: String,
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  offer: {
    endDate: Date,
    totalQuantity: Number,
    remainingQuantity: Number
  },
  image: {
    type: String,
    default: function() {
      return `/images/products/${this.slug}.jpg`;
    }
  },
  reviews: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: function() {
      return this.stock > 0;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add this after the schema definition
ProductSchema.virtual('categoryName', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
  get: function(category) {
    return category ? category.name : null;
  }
});

// Auto-generate slug from name
ProductSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  next();
});

// Add this index for better query performance
ProductSchema.index({ featured: 1 });
ProductSchema.index({ discount: 1, 'offer.endDate': 1 });

export default mongoose.model('Product', ProductSchema);  // Changed from productSchema to ProductSchema