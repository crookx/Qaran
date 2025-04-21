const express = require('express');
const app = express();
const cors = require('cors');

const ALLOWED_ORIGINS = [
  'https://qaranbaby.com',
  'https://baby-shop-mcqv.vercel.app',
  'https://baby-shop-mcqv-h1tp7d2j0-crookxs-projects.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept'
  ]
}));

// Handle preflight requests
app.options('*', cors());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
import wishlistRoutes from './routes/wishlistRoutes.js';
app.use('/api/wishlist', wishlistRoutes);
// ... other routes

module.exports = app;