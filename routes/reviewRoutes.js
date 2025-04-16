import express from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', protect, createReview);

export default router;