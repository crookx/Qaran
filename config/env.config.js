const config = {
  production: {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    CORS_ORIGIN: [
      'https://qaranbaby.com',
      'https://baby-shop-mcqv.vercel.app',
      'https://baby-shop-mcqv-h1tp7d2j0-crookxs-projects.vercel.app'
    ]
  },
  development: {
    PORT: process.env.PORT || 8080,
    MONGODB_URI: 'mongodb://localhost:27017/qaran_db',
    CORS_ORIGIN: 'http://localhost:3000'
  }
};

const env = process.env.NODE_ENV || 'development';

const envConfig = {
  ...config[env],
  ENV: env
};

export default envConfig;