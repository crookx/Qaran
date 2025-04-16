const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error:', err.message);
  // Prevent crash on Redis connection failure
});

redisClient.on('connect', () => {
  console.log('Redis Connected');
});

module.exports = redisClient;