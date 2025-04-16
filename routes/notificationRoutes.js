import express from 'express';
import {
    getNotifications,
    markAsRead,
    deleteNotification,
    clearAllNotifications
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

export default router;