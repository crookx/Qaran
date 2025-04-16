import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  res.status(200).json({
    status: 'success',
    data: { products: wishlist.products }
  });
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  // Check if product is already in wishlist
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  // Populate the products before sending response
  wishlist = await wishlist.populate('products');

  res.status(200).json({
    status: 'success',
    data: { products: wishlist.products }
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.products = wishlist.products.filter(
    product => product.toString() !== req.params.productId
  );

  await wishlist.save();
  wishlist = await wishlist.populate('products');

  res.status(200).json({
    status: 'success',
    data: { products: wishlist.products }
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error('Wishlist not found');
  }

  wishlist.products = [];
  await wishlist.save();

  res.status(200).json({
    status: 'success',
    data: { products: [] }
  });
});