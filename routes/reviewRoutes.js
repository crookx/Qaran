import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats,
  markReviewHelpful
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes - removed /product/ prefix
router.get('/:productId', getProductReviews);
router.get('/stats/:productId', getReviewStats);
router.post('/:id/helpful', markReviewHelpful);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.route('/:id')
  .patch(updateReview)
  .delete(deleteReview);

export default router;