import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { AppError } from '../middleware/errorHandler.js';

export const createOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return next(new AppError('No items in cart', 400));
    }

    const newOrder = await Order.create({
      user: req.user.id,
      products: cart.items,
      shippingAddress: req.body.shippingAddress,
      totalAmount: cart.items.reduce((total, item) => 
        total + (item.product.price * item.quantity), 0)
    });

    // Clear cart after order creation
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } }
    );

    res.status(201).json({
      status: 'success',
      data: { order: newOrder }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user').populate('products.product');
    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product');

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('products.product');
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};