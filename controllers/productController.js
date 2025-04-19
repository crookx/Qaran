import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Offer from '../models/Offer.js';  // Add this import
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import cache from 'memory-cache';

// Add sorting and search functionality
export const getProducts = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 12, 
    sort, 
    category, 
    priceRange, 
    ageGroup,
    search 
  } = req.query;
  
  const query = {};
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Handle category by name instead of ID
  if (category) {
    const categoryDoc = await Category.findOne({ name: { $regex: category, $options: 'i' } });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    } else {
      query.category = null; // Will return no results if category doesn't exist
    }
  }
  
  if (ageGroup) query.ageGroup = ageGroup;
  
  // Validate price range
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      query.price = { $gte: min, $lte: max };
    }
  }

  // Implement caching
  const cacheKey = `products-${JSON.stringify({ query, page, limit, sort })}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  // Enhanced sorting
  let sortQuery = {};
  switch (sort) {
    case 'price_asc':
      sortQuery = { price: 1 };
      break;
    case 'price_desc':
      sortQuery = { price: -1 };
      break;
    case 'name_asc':
      sortQuery = { name: 1 };
      break;
    case 'newest':
    default:
      sortQuery = { createdAt: -1 };
  }

  try {
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);
    
    const result = {
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalProducts: count
    };

    // Cache for 5 minutes
    cache.put(cacheKey, result, 300000);
    res.status(200).json(result);
  } catch (error) {
    throw new AppError('Error fetching products: ' + error.message, 400);
  }
});

export const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  res.status(200).json(product);
});

// Update getFeaturedProducts function
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .populate('category');
    
    console.log('Found featured products:', products.length);
    res.status(200).json({
      status: 'success',
      data: products
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getProductsByCategory = catchAsync(async (req, res) => {
  // First find the category by slug or name
  const category = await Category.findOne({
    $or: [
      { slug: req.params.category },
      { name: { $regex: new RegExp(req.params.category, 'i') }}
    ]
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const products = await Product.find({ category: category._id })
    .populate('category', 'name');
  
  res.status(200).json({
    status: 'success',
    data: products
  });
});

export const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find()
    .select('name image description slug')
    .sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    data: categories
  });
});

// Update getSpecialOffers function 
export const getSpecialOffers = async (req, res) => {
  try {
    const currentDate = new Date();
    console.log('Current Date:', currentDate);

    // Get all active offers
    const activeOffers = await Offer.find()
      .populate('productId')
      .lean();

    console.log('Found offers:', activeOffers);

    if (!activeOffers.length) {
      console.log('No offers found');
      return res.json({ status: 'success', data: [] });
    }

    const formattedOffers = activeOffers
      .filter(offer => offer.productId && offer.remainingQuantity > 0)
      .map(offer => ({
        _id: offer._id,
        name: offer.name,
        productId: offer.productId._id,
        productName: offer.productId.name,
        image: offer.productId.image,
        price: offer.productId.price,
        discount: offer.discount,
        discountedPrice: Math.round(offer.productId.price * (1 - offer.discount / 100)),
        remaining: offer.remainingQuantity,
        total: offer.totalQuantity
      }));

    console.log('Formatted offers:', formattedOffers);

    return res.json({
      status: 'success',
      data: formattedOffers
    });

  } catch (error) {
    console.error('Error in getSpecialOffers:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

function getTimeRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}d ${hours}h`;
}

export const createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    status: 'success',
    data: product
  });
});

export const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {
    throw new AppError('No product found with that ID', 404);
  }

  // Clear cache
  cache.clear();

  res.status(200).json({
    status: 'success',
    data: product
  });
});

export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new AppError('No product found with that ID', 404);
  }

  // Clear cache
  cache.clear();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Export all functions
export default {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories,
  getSpecialOffers,
  createProduct,
  updateProduct,
  deleteProduct
};
