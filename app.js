const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

const ALLOWED_ORIGINS = [
  'https://baby-shop-mcqv.vercel.app',
  'https://baby-shop-mcqv-git-master-crookxs-projects.vercel.app',
  'http://localhost:3000'
];

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  credentials: true,
  maxAge: 86400
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Export the app instance to be configured in server.js
module.exports = app;
