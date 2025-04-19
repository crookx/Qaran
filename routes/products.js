const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/sanitizer');
const { AppError } = require('../middleware/errorHandler');
const Product = require('../models/Product');

// Get featured products
router.get('/featured', apiLimiter, async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true })
      .select('-sensitiveData')
      .limit(4);

    res.json({
      status: 'success',
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// Get special offers
router.get('/offers', apiLimiter, async (req, res, next) => {
  try {
    const offers = await Product.find({ isOnSale: true })
      .select('-sensitiveData')
      .limit(4);

    res.json({
      status: 'success',
      data: offers
    });
  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/categories', apiLimiter, async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const products = await Product.find()
      .select('-sensitiveData')
      .limit(parseInt(req.query.limit) || 10);

    res.json({
      status: 'success',
      data: { products }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', apiLimiter, async (req, res, next) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    
    if (!req.csrfToken()) {
      throw new AppError('Invalid CSRF token', 403);
    }

    const product = await Product.create(sanitizedData);

    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;