const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');
const {
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Public routes
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.use(verifyToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);

module.exports = router;