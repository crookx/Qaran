import express from 'express';
import { getCart, toggleCart, addToCart, checkCartItem } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart);

router.route('/toggle')
  .post(toggleCart);

router.route('/add')
  .post(toggleCart);  // Use toggleCart for both add and toggle endpoints

router.route('/check/:productId')
  .get(checkCartItem);

export default router;