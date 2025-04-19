const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: ['https://baby-shop-mcqv-h1tp7d2j0-crookxs-projects.vercel.app'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
import wishlistRoutes from './routes/wishlistRoutes.js';
app.use('/api/wishlist', wishlistRoutes);
// ... other routes

module.exports = app;