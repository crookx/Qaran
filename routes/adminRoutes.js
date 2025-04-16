import express from 'express';
import {
    getDashboardStats,
    getUsers,
    getOrders,
    getProducts,
    updateOrderStatus,
    deleteUser,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/adminController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Protect all admin routes
router.use(verifyToken);
router.use(restrictTo('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// Order management
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Product management
router.get('/products', getProducts);
router.post('/products', upload.array('images', 5), createProduct);
router.patch('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;