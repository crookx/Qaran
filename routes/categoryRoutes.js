import express from 'express';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { protect, checkRole } from '../middleware/auth.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';

const router = express.Router();

// Get all categories
router.get('/', apiLimiter, catchAsync(async (req, res) => {
  const categories = await Category.find()
    .select('name image description slug')
    .sort({ name: 1 });

  if (!categories) {
    return res.status(404).json({
      status: 'error',
      message: 'No categories found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: categories
  });
}));

// Get category by slug
router.get('/:slug', apiLimiter, catchAsync(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return res.status(404).json({
      status: 'error',
      message: 'Category not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: category
  });
}));

// Get products by category
router.get('/:slug/products', apiLimiter, catchAsync(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    return res.status(404).json({
      status: 'error',
      message: 'Category not found'
    });
  }

  const products = await Product.find({ category: category._id })
    .populate('category')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: { products }
  });
}));

// Protected admin routes
router.use(protect);
router.use(checkRole(['admin']));

router.post('/', catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({
    status: 'success',
    data: category
  });
}));

router.put('/:id', catchAsync(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({
      status: 'error',
      message: 'Category not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: category
  });
}));

router.delete('/:id', catchAsync(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({
      status: 'error',
      message: 'Category not found'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
}));

export default router;