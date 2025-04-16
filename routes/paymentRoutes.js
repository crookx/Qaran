const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const {
  createPaymentIntent,
  processRefund
} = require('../controllers/paymentController');

router.use(verifyToken);
router.use(apiLimiter);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/refund', processRefund);

module.exports = router;