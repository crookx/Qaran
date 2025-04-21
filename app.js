const express = require('express');
const app = express();
const cors = require('cors');

// Allowed frontend origins
const ALLOWED_ORIGINS = [
  'https://qaranbaby.com',
  'https://baby-shop-mcqv.vercel.app',
  'https://baby-shop-mcqv-h1tp7d2j0-crookxs-projects.vercel.app',
  'http://localhost:3000'
];

// CORS middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Access-Control-Allow-Origin',  // Add this
    'Access-Control-Allow-Headers'  // Add this
  ]
}));
