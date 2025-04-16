import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized - No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized - Invalid token' });
  }
};

// Role-based access control middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};

// Alias for restrictTo for backward compatibility
export const checkRole = restrictTo;

export const verifyToken = protect;

export default {
  protect,
  restrictTo,
  checkRole,
  verifyToken
};