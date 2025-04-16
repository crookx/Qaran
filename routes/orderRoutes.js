import express from 'express';
import {
    getAllOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getUserOrders
} from '../controllers/orderController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - all order routes require authentication
router.use(verifyToken);

// User routes
router.get('/my-orders', getUserOrders);
router.post('/', createOrder);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', getAllOrders);
router.get('/:id', getOrder);
router.patch('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;