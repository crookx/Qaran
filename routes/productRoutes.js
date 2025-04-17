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
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});
router.get('/offers', async (req, res) => {
  try {
    const offers = await Product.find({ onSale: true })
      .populate('category');
    res.json({
      status: 'success',
      data: offers
    });
  } catch (error) {
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
      // Find category by slug first
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
    res.status(500).json({ message: error.message });
  }
});

// Protected admin routes
router.use(protect); // Apply authentication to all routes below
router.post('/', checkRole(['admin']), createProduct);
router.put('/:id', checkRole(['admin']), updateProduct);
router.delete('/:id', checkRole(['admin']), deleteProduct);

export default router;