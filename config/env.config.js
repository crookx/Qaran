const config = {
  production: {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    CORS_ORIGIN: 'https://qaranbaby.com'
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