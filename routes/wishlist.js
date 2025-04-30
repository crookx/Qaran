const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// Toggle wishlist item
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    const itemIndex = wishlist.items.indexOf(productId);
    const isInWishlist = itemIndex > -1;

    if (isInWishlist) {
      wishlist.items.splice(itemIndex, 1);
    } else {
      wishlist.items.push(productId);
    }

    await wishlist.save();
    await wishlist.populate('items');

    res.json({
      status: 'success',
      data: {
        wishlist,
        isInWishlist: !isInWishlist
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get wishlist
router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('items');

    res.json({
      status: 'success',
      data: wishlist || { items: [] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;