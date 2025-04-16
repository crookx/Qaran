const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/sanitizer');
const EncryptionService = require('../services/encryption');
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create', async (req, res) => {
  try {
    const { user, items, payment, total } = req.body;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Convert to cents
      currency: 'usd',
      payment_method_types: ['card']
    });

    // Create order
    const order = new Order({
      user,
      items,
      payment: {
        ...payment,
        status: 'pending',
        transactionId: paymentIntent.id
      },
      total
    });

    await order.save();

    res.json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', apiLimiter, async (req, res, next) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    
    const encryptedPaymentDetails = EncryptionService.encrypt(
      JSON.stringify(sanitizedData.paymentDetails)
    );

    const order = await Order.create({
      ...sanitizedData,
      paymentDetails: encryptedPaymentDetails,
      user: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: { orderId: order._id }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;