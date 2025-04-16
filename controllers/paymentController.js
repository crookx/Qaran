const PaymentService = require('../services/paymentService');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      status: 'pending'
    });

    if (!order) {
      return next(new AppError('Order not found or already processed', 404));
    }

    const paymentIntent = await PaymentService.createPaymentIntent(order.totalAmount);

    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret
      }
    });
  } catch (error) {
    next(error);
  }
};

const processRefund = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
      status: 'paid'
    });

    if (!order) {
      return next(new AppError('Order not found or cannot be refunded', 404));
    }

    const refund = await PaymentService.processRefund(order.paymentIntentId);

    await Order.findByIdAndUpdate(orderId, { status: 'refunded' });

    res.status(200).json({
      status: 'success',
      data: { refund }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  processRefund
};