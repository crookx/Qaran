import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getWishlist, toggleWishlist, clearWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.use(verifyToken);

router.route('/')
  .get(getWishlist);

router.route('/toggle')
  .post(toggleWishlist);

router.route('/clear')
  .delete(clearWishlist);

export default router;