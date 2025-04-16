require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    salt: process.env.SALT
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    maxAge: 86400
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  csrf: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  }
};