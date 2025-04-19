import express from 'express';
import Offer from '../models/Offer.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/offers', async (req, res) => {
  try {
    const offers = await Offer.find({}).populate('productId');
    res.json({
      status: 'success',
      totalOffers: offers.length,
      currentTime: new Date(),
      data: offers
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;