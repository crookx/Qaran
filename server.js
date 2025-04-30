import dotenv from 'dotenv';
dotenv.config(); // This needs to be at the very top

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment before other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import offerRoutes from './routes/offerRoutes.js'; // ✅ Import OfferRoutes

import connectDB from './config/db.js';

const app = express();

// Environment setup
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = 8080;
const FRONTEND_URL = NODE_ENV === 'production' 
  ? 'https://qaranbaby.com'
  : 'http://localhost:3000';

const ALLOWED_ORIGINS = [
  'https://qaranbaby.com',
  'https://baby-shop-mcqv.vercel.app',
  'https://baby-shop-mcqv-git-master-crookxs-projects.vercel.app',
  'http://localhost:3000',
  'https://baby-shop-xi.vercel.app'
];

// CORS configuration
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'Accept',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Handle OPTIONS preflight
app.options('*', cors());

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
if (NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/offers', offerRoutes); // ✅ Registered here

// Error handling
app.use(notFound);
app.use(errorHandler);

// Move database connection and server initialization into an async function
const startServer = async () => {
  try {
    console.log('Starting server in', NODE_ENV, 'mode...');
    console.log('Server will run on port:', PORT);
    
    console.log('MongoDB URI:', process.env.MONGODB_LOCAL_URI || 'Using production URI');

    const connection = await connectDB();

    if (!connection) {
      throw new Error('Failed to establish database connection');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });

    process.on('unhandledRejection', (err) => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
