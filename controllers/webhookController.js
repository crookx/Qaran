const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const sendEmail = require('../utils/email');

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }

  res.json({ received: true });
};

async function handlePaymentSuccess(paymentIntent) {
  const order = await Order.findOne({
    'paymentInfo.transactionId': paymentIntent.id
  }).populate('user');

  if (order) {
    order.paymentInfo.status = 'completed';
    order.status = 'processing';
    await order.save();

    // Send confirmation email
    await sendEmail({
      to: order.user.email,
      subject: 'Order Confirmation',
      template: 'orderConfirmation',
      templateData: {
        orderNumber: order._id,
        total: order.total,
        estimatedDelivery: order.estimatedDelivery.toLocaleDateString()
      }
    });
  }
}

async function handlePaymentFailure(paymentIntent) {
  const order = await Order.findOne({
    'paymentInfo.transactionId': paymentIntent.id
  }).populate('user');

  if (order) {
    order.paymentInfo.status = 'failed';
    await order.save();

    // Send failure notification
    await sendEmail({
      to: order.user.email,
      subject: 'Payment Failed',
      template: 'paymentFailed',
      templateData: {
        orderNumber: order._id,
        total: order.total
      }
    });
  }
}