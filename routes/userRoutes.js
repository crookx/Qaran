import express from 'express';
import { verifyToken, restrictTo } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import User from '../models/User.js';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Protected routes - these should be middleware functions
router.use(verifyToken);
router.use(apiLimiter);

// User routes
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.get('/', restrictTo('admin'), getAllUsers);
router.get('/:id', restrictTo('admin'), getUser);
router.patch('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);

export default router;