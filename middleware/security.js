const csrf = require('csurf');
const xss = require('xss-clean');
const hpp = require('hpp');
const LoggerService = require('../services/loggerService');

const csrfProtection = csrf({ cookie: true });

const securityHeaders = (req, res, next) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Security Headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
};

const errorHandler = (err, req, res, next) => {
  LoggerService.error('Application error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate field value'
    });
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
};

module.exports = {
  csrfProtection,
  xssClean: xss(),
  preventParamPollution: hpp(),
  securityHeaders,
  errorHandler
};