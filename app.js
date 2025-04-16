const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
import wishlistRoutes from './routes/wishlistRoutes.js';
app.use('/api/wishlist', wishlistRoutes);
// ... other routes

module.exports = app;