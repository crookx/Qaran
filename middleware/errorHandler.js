import { NODE_ENV, isDev } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Set Content-Type to application/json
  res.setHeader('Content-Type', 'application/json');

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
};