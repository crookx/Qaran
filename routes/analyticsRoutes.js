import express from 'express';
import {
    getSalesAnalytics,
    getProductAnalytics,
    getUserAnalytics,
    getOrderAnalytics
} from '../controllers/analyticsController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all analytics routes
router.use(verifyToken);
router.use(restrictTo('admin'));

router.get('/sales', getSalesAnalytics);
router.get('/products', getProductAnalytics);
router.get('/users', getUserAnalytics);
router.get('/orders', getOrderAnalytics);

export default router;