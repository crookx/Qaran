import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import winston from 'winston';
import connectDB from './config/db.js';
import config from './config/env.config.js';
import debugRoutes from './routes/debugRoutes.js';

// Load environment variables before any other configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '../.env' : '../.env.development';
dotenv.config({
  path: path.join(__dirname, envFile)
});

const app = express();

// Environment setup
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = 8080; // Force port 8080 for both environments
const FRONTEND_URL = NODE_ENV === 'production' 
  ? 'https://qaranbaby.com'
  : 'http://localhost:3000';

const ALLOWED_ORIGINS = [
  'https://baby-shop-mcqv.vercel.app',
  'http://localhost:3000'
];

console.log(`Starting server in ${NODE_ENV} mode...`);

// CORS Configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Basic middleware setup
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('dev'));
app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" }
}));

// Serve static files
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Connect to MongoDB before setting up routes
try {
  console.log('Attempting MongoDB connection...');
  await connectDB();
  console.log(`Server running in ${NODE_ENV} mode`);
  
  // List available collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Available collections:', collections.map(col => col.name));
  
  // API Routes
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  // Add debug routes in development
  if (process.env.NODE_ENV === 'development') {
    app.use('/api/debug', debugRoutes);
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime()
    });
  });

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

export default app;
