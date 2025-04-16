import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

export default router;