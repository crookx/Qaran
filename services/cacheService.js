const redisClient = require('../config/redis');

class CacheService {
  static async getProducts(category) {
    try {
      const cacheKey = `products:${category || 'all'}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache Error:', error);
      return null;
    }
  }

  static async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache Get Error:', error);
      return null;
    }
  }

  static async set(key, value, expireTime = 3600) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', expireTime);
      return true;
    } catch (error) {
      console.error('Cache Set Error:', error);
      return false;
    }
  }

  static async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache Delete Error:', error);
      return false;
    }
  }

  static async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache Delete Pattern Error:', error);
      return false;
    }
  }
}

module.exports = CacheService;