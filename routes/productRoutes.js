import express from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getSpecialOffers,
  getProductsByCategory,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { validateQuery, productQuerySchema } from '../middleware/validateRequest.js';
import { protect, checkRole } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Offer from '../models/Offer.js';
import mongoose from 'mongoose';

const router = express.Router();

router.use(apiLimiter);

// Special routes MUST come before dynamic routes
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .populate('category')
      .limit(8);
    res.json({
      status: 'success',
      data: products
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

router.get('/offers', async (req, res) => {
  try {
    const currentDate = new Date();
    
    // First check if products exist for the offer IDs
    const allOffers = await Offer.find({}).lean();
    console.log('Raw offers:', allOffers);

    const productIds = allOffers.map(offer => 
      mongoose.Types.ObjectId.isValid(offer.productId) ? 
        new mongoose.Types.ObjectId(offer.productId) : null
    ).filter(id => id !== null);

    const validProducts = await Product.find({
      '_id': { $in: productIds }
    }).select('_id');

    const validProductIds = validProducts.map(p => p._id.toString());
    console.log('Valid product IDs:', validProductIds);

    // Get offers with valid products and dates
    const offers = await Offer.find({
      endDate: { $gte: currentDate },
      productId: { $in: validProductIds }
    }).populate({
      path: 'productId',
      select: 'name price images description category',
      populate: {
        path: 'category',
        select: 'name slug'
      }
    });

    console.log('Found offers:', offers);

    const formattedOffers = offers
      .filter(offer => offer.productId && offer.productId.price)
      .map(offer => ({
        _id: offer._id,
        name: offer.name,
        product: {
          _id: offer.productId._id,
          name: offer.productId.name,
          price: offer.productId.price,
          images: offer.productId.images,
          description: offer.productId.description,
          category: offer.productId.category
        },
        discount: offer.discount,
        startDate: offer.startDate,
        endDate: offer.endDate,
        totalQuantity: offer.totalQuantity,
        remainingQuantity: offer.remainingQuantity,
        discountedPrice: Number((offer.productId.price * (1 - offer.discount / 100)).toFixed(2)),
        isUpcoming: new Date(offer.startDate) > currentDate,
        status: new Date(offer.startDate) > currentDate ? 'upcoming' : 'active'
      }));

    res.json({
      status: 'success',
      data: formattedOffers
    });
  } catch (error) {
    console.error('Error in offers route:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

router.get('/category/:category', getProductsByCategory);

// Base routes
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        query.category = category._id;
      }
    }

    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Protected admin routes
router.use(protect);
router.post('/', checkRole(['admin']), createProduct);
router.put('/:id', checkRole(['admin']), updateProduct);
router.delete('/:id', checkRole(['admin']), deleteProduct);

export default router;