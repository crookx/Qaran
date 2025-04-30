const config = {
  production: {
    PORT: 8080,  // Force port 8080 everywhere
    MONGODB_URI: process.env.MONGODB_URI,
    CORS_ORIGIN: [
      'https://qaranbaby.com',
      'https://baby-shop-mcqv.vercel.app',
      'https://baby-shop-mcqv-git-master-crookxs-projects.vercel.app'
    ]
  },
  development: {
    PORT: 8080, // Force port 8080 for development
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