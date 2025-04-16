import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }
  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }]
    });
  } else {
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
  }

  cart = await cart.populate('items.product');
  res.json(cart);
});

// @desc    Update cart item quantity
// @route   PATCH /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  item.quantity = quantity;
  await cart.save();
  
  const updatedCart = await cart.populate('items.product');
  res.json(updatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );
  
  await cart.save();
  const updatedCart = await cart.populate('items.product');
  res.json(updatedCart);
});