import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.product?.price || 0) * item.quantity, 0);

    res.json({
      status: 'success',
      items: cart.items,
      totalItems,
      totalAmount
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const toggleCart = async (req, res) => {
  try {
    const { productId } = req.body;
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Remove item if it exists
      cart.items.splice(existingItemIndex, 1);
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    await cart.populate('items.product');

    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.product?.price || 0) * item.quantity, 0);

    res.status(200).json({
      status: 'success',
      items: cart.items,
      totalItems,
      totalAmount,
      message: existingItemIndex > -1 ? 'Item removed from cart' : 'Item added to cart'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.product?.price || 0) * item.quantity, 0);

    res.status(200).json({
      status: 'success',
      items: cart.items,
      totalItems,
      totalAmount
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const checkCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    
    const isInCart = cart?.items.some(item => 
      item.product.toString() === productId
    );

    res.status(200).json({
      status: 'success',
      isInCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};