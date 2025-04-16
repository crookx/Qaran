const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all addresses
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new address
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update address
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    Object.assign(address, req.body);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;