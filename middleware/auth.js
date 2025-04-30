import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const publicRoutes = [
  { path: '/products', method: 'GET' },
  { path: /^\/products\/related\/.*/, method: 'GET' },  // Allow related products access
  { path: /^\/products\/[^/]+$/, method: 'GET' },
  { path: /^\/products\/[^/]+\/reviews$/, method: 'GET' },
  { path: /^\/products\/[^/]+\/stats$/, method: 'GET' },
  { path: '/reviews/product', method: 'GET' },
  { path: '/reviews/stats', method: 'GET' },
  { path: '/auth/login', method: 'POST' },
  { path: '/auth/register', method: 'POST' }
];

export const protect = async (req, res, next) => {
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.path instanceof RegExp) {
      return route.path.test(req.path) && route.method === req.method;
    }
    return route.path === req.path && route.method === req.method;
  });

  if (isPublicRoute) {
    return next();
  }

  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.status(401).json({ 
        status: 'unauthorized',
        message: 'Please login first',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(401).json({ 
          status: 'unauthorized',
          message: 'User not found',
          code: 'AUTH_REQUIRED'
        });
      }
      
      next();
    } catch (error) {
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.status(401).json({ 
        status: 'unauthorized',
        message: 'Invalid token',
        code: 'AUTH_REQUIRED' 
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
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