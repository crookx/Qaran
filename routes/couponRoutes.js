import express from 'express';
import {
    getAllCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/couponController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/validate', validateCoupon);

// Protected routes
router.use(verifyToken);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', getAllCoupons);
router.get('/:id', getCoupon);
router.post('/', createCoupon);
router.patch('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;