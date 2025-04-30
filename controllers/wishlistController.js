import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items.product');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      status: 'success',
      data: {
        items: wishlist.items,
        totalItems: wishlist.items.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Toggle wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    const existingItemIndex = wishlist.items.findIndex(
      item => item.product.toString() === productId.toString()
    );

    let isInWishlist = true;
    if (existingItemIndex !== -1) {
      // Remove if exists
      wishlist.items.splice(existingItemIndex, 1);
      isInWishlist = false;
    } else {
      // Add if doesn't exist
      wishlist.items.push({ product: productId });
    }

    await wishlist.save();
    await wishlist.populate('items.product');

    res.status(200).json({
      status: 'success',
      data: {
        items: wishlist.items,
        totalItems: wishlist.items.length,
        isInWishlist
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        status: 'error',
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: {
        items: [],
        totalItems: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};