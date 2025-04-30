import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Offer from '../models/Offer.js';
import Question from '../models/Question.js';
import Review from '../models/Review.js';
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
  
  let query = {};
  
  // Handle category filter
  if (category) {
    const categoryDoc = await Category.findOne({ 
      $or: [
        { slug: category },
        { _id: mongoose.isValidObjectId(category) ? category : null }
      ]
    });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    }
  }
  
  // Handle price range filter
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      query.price = { 
        $gte: parseFloat(min), 
        $lte: parseFloat(max) 
      };
    }
  }

  // Handle age group filter
  if (ageGroup && ageGroup !== 'all') {
    query.ageGroup = ageGroup + " months"; // Add "months" to match database format
  }

  // Handle search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  console.log('Final query:', JSON.stringify(query, null, 2));

  // Handle sorting
  let sortOptions = {};
  switch (sort) {
    case 'price_asc':
      sortOptions = { price: 1 };
      break;
    case 'price_desc':
      sortOptions = { price: -1 };
      break;
    case 'name_asc':
      sortOptions = { name: 1 };
      break;
    case 'name_desc':
      sortOptions = { name: -1 };
      break;
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 }; // Default to newest
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  try {
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category'),
      Product.countDocuments(query)
    ]);

    console.log(`Found ${products.length} products matching filters`);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        products,
        currentPage: parseInt(page),
        totalPages,
        total,
        filters: {
          priceRange,
          ageGroup,
          sort
        }
      }
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
});

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .lean();
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Add additional product details like stock status
    const productWithDetails = {
      ...product,
      inStock: product.stock > 0,
      isNew: isProductNew(product.createdAt)
    };

    res.json({
      status: 'success',
      data: productWithDetails
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch product'
    });
  }
};

const isProductNew = (createdAt) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(createdAt) > thirtyDaysAgo;
};

export const getFeaturedProducts = async (req, res) => {
  try {
    console.log('Fetching featured products...');
    const featuredProducts = await Product.find({ featured: true })
      .populate('category')
      .limit(8);
    
    console.log('Fetched featured products:', featuredProducts);
    
    res.status(200).json({
      status: 'success',
      data: featuredProducts
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

export const getProductsByCategory = catchAsync(async (req, res) => {
  const { page = 1, limit = 12, sort, priceRange, ageGroup } = req.query;
  
  // First find the category
  const category = await Category.findOne({
    $or: [
      { slug: req.params.category },
      { name: { $regex: new RegExp(req.params.category, 'i') }}
    ]
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  let query = { category: category._id };

  // Handle price range filter
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      query.price = { 
        $gte: parseFloat(min), 
        $lte: parseFloat(max) 
      };
    }
  }

  // Handle age group filter
  if (ageGroup && ageGroup !== 'all') {
    query.ageGroup = ageGroup;
  }

  // Handle sorting
  let sortOptions = {};
  switch (sort) {
    case 'price_asc':
      sortOptions = { price: 1 };
      break;
    case 'price_desc':
      sortOptions = { price: -1 };
      break;
    case 'name_asc':
      sortOptions = { name: 1 };
      break;
    case 'name_desc':
      sortOptions = { name: -1 };
      break;
    default:
      sortOptions = { createdAt: -1 }; // Default to newest
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category'),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: {
      products,
      currentPage: parseInt(page),
      totalPages,
      total,
      filters: {
        priceRange,
        ageGroup,
        sort
      }
    }
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

export const getSpecialOffers = async (req, res) => {
  try {
    console.log('Fetching special offers...');
    const currentDate = new Date();
    const offers = await Offer.find({
      endDate: { $gte: currentDate }
    }).populate({
      path: 'productId',
      select: 'name price images description category slug',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    console.log(`Found ${offers.length} special offers`);

    const formattedOffers = offers
      .filter(offer => offer.productId)
      .map(offer => ({
        _id: offer._id,
        product: offer.productId,
        discount: offer.discount,
        startDate: offer.startDate,
        endDate: offer.endDate,
        remainingQuantity: offer.remainingQuantity,
        totalQuantity: offer.totalQuantity
      }));

    res.status(200).json({
      status: 'success',
      data: {
        offers: formattedOffers
      }
    });
  } catch (error) {
    console.error('Error in getSpecialOffers:', error);
    res.status(500).json({ 
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

export const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching reviews for product:', id);

    // Convert string ID to ObjectId
    const productId = mongoose.Types.ObjectId.isValid(id) 
      ? new mongoose.Types.ObjectId(id)
      : null;

    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID format'
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    console.log(`Found ${reviews.length} reviews`);

    return res.status(200).json({
      status: 'success',
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch reviews'
    });
  }
};

export const getProductQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await Question.find({ product: id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const submitQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    
    const newQuestion = await Question.create({
      product: id,
      user: req.user._id,
      question,
    });

    await newQuestion.populate('user', 'name avatar');

    res.status(201).json({
      status: 'success',
      data: newQuestion
    });
  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findById(id).populate('category');
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Flexible query that matches either category OR age group with similar price
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: product.category._id },
        { 
          $and: [
            { ageGroup: product.ageGroup },
            { price: { 
              $gte: product.price * 0.5,
              $lte: product.price * 1.5 
            }}
          ]
        }
      ]
    })
    .limit(8)
    .select('name price images description discount category ageGroup')
    .populate('category', 'name');

    // Count products by match type for debugging
    const categoryMatches = relatedProducts.filter(p => 
      p.category._id.toString() === product.category._id.toString()
    ).length;
    
    const ageGroupMatches = relatedProducts.filter(p => 
      p.ageGroup === product.ageGroup
    ).length;

    return res.status(200).json({
      status: 'success',
      data: relatedProducts,
      debug: {
        sourceProduct: {
          id: product._id,
          category: product.category.name,
          price: product.price,
          ageGroup: product.ageGroup
        },
        matches: {
          total: relatedProducts.length,
          byCategory: categoryMatches,
          byAgeGroup: ageGroupMatches
        }
      }
    });
  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch related products',
      error: error.message
    });
  }
};

export const getProductStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId.createFromHexString(id) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]);

    const ratingDistribution = stats.length > 0 ? stats[0].ratings.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {}) : {};

    res.status(200).json({
      status: 'success',
      data: {
        average: stats.length > 0 ? stats[0].avgRating : 0,
        total: stats.length > 0 ? stats[0].numReviews : 0,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error getting product stats:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

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
  deleteProduct,
  getProductReviews,
  getProductQuestions,
  submitQuestion,
  getRelatedProducts,
  getProductStats
};
