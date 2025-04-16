const CacheService = require('../services/cacheService');

const cache = (prefix, expireTime) => async (req, res, next) => {
  try {
    const key = `${prefix}:${req.originalUrl}`;
    const cachedData = await CacheService.get(key);

    if (cachedData) {
      return res.json(cachedData);
    }

    // Store original res.json
    const originalJson = res.json;
    
    // Override res.json
    res.json = function(data) {
      CacheService.set(key, data, expireTime);
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = cache;