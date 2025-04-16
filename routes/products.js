const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/sanitizer');
const { AppError } = require('../middleware/errorHandler');

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