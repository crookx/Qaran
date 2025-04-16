import express from 'express';
import {
    getInventory,
    updateStock,
    getLowStock,
    getInventoryHistory,
    addInventoryAdjustment
} from '../controllers/inventoryController.js';
import { verifyToken, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all inventory routes with admin access
router.use(verifyToken);
router.use(restrictTo('admin'));

router.get('/', getInventory);
router.get('/low-stock', getLowStock);
router.get('/history', getInventoryHistory);
router.patch('/:productId/stock', updateStock);
router.post('/adjustment', addInventoryAdjustment);

export default router;