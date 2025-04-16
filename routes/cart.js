const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update cart item
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity, price, name, image } = req.body;
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price, name, image });
    }

    cart.total = cart.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item quantity
router.put('/update/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    
    const item = cart.items.find(item => 
      item.productId.toString() === req.params.productId
    );
    
    if (item) {
      item.quantity = quantity;
      cart.total = cart.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    cart.items = cart.items.filter(item => 
      item.productId.toString() !== req.params.productId
    );
    cart.total = cart.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;