import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  images: [String]
});

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
    index: true
  },
  basePrice: {
    type: Number,
    required: true
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
    enum: [
      "0-3 months",
      "3-6 months",
      "6-12 months",
      "12-24 months",
      "24+ months",
      "all"
    ],
    default: 'all',
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
  variants: [variantSchema],
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: v => Math.round(v * 10) / 10 // Round to 1 decimal place
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  brand: {
    type: String,
    required: true
  },
  specifications: {
    material: String,
    care: [String],
    warranty: String,
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      unit: String
    },
    weight: {
      value: Number,
      unit: String
    }
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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

// Virtual for reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  options: { sort: { createdAt: -1 } }
});

// Virtual for category name
ProductSchema.virtual('categoryName', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
  get: function(category) {
    return category ? category.name : null;
  }
});

// Auto-generate slug
ProductSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// Update inStock based on stock value
ProductSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

// Add method to check variant availability
ProductSchema.methods.checkVariantAvailability = function(color, size) {
  const variant = this.variants.find(v => v.color === color && v.size === size);
  return variant ? variant.stock > 0 : false;
};

// Add method to get variant price
ProductSchema.methods.getVariantPrice = function(color, size) {
  const variant = this.variants.find(v => v.color === color && v.size === size);
  return variant ? variant.price : this.basePrice;
};

// Indexes for better query performance
ProductSchema.index({ featured: 1 });
ProductSchema.index({ discount: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ 'specifications.material': 1 });

export default mongoose.model('Product', ProductSchema);