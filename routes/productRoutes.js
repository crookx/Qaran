import express from 'express';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { protect, checkRole } from '../middleware/auth.js';
import { 
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  getSpecialOffers,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews,
  getRelatedProducts,
  getProductStats
} from '../controllers/productController.js';

const router = express.Router();

// Public routes - order matters (more specific first)
router.get('/related/:id', apiLimiter, getRelatedProducts);
router.get('/:id/reviews', apiLimiter, getProductReviews);
router.get('/:id/stats', apiLimiter, getProductStats);
router.get('/featured', apiLimiter, getFeaturedProducts);
router.get('/offers', apiLimiter, getSpecialOffers);
router.get('/category/:category', apiLimiter, getProductsByCategory);
router.get('/:id', apiLimiter, getProductById);
router.get('/', apiLimiter, getProducts);

// Protected admin routes
router.use(protect);
router.use(checkRole(['admin']));

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;