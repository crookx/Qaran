const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { sendOrderStatusEmail } = require('../utils/emailService');

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const order = await Order.findOneAndUpdate(
        { 'payment.transactionId': paymentIntent.id },
        { 
          $set: { 
            'payment.status': 'completed',
            status: 'processing'
          }
        },
        { new: true }
      );
      
      if (order) {
        await sendOrderStatusEmail(order.user.email, 'payment_success', order);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      const failedOrder = await Order.findOneAndUpdate(
        { 'payment.transactionId': failedPayment.id },
        { 
          $set: { 
            'payment.status': 'failed',
            status: 'payment_failed'
          }
        }
      );
      
      if (failedOrder) {
        await sendOrderStatusEmail(failedOrder.user.email, 'payment_failed', failedOrder);
      }
      break;
  }

  res.json({ received: true });
});

module.exports = router;