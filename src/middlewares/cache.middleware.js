const NodeCache = require('node-cache');

// Create cache instance (TTL in seconds)
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default

// Middleware to cache responses
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.send(cachedResponse);
      return;
    }

    // Override res.send to cache the response
    const originalSend = res.send;
    res.send = function (body) {
      cache.set(key, body, duration || 300); // Cache for specified duration
      originalSend.call(this, body);
    };

    next();
  };
};

// Function to clear cache for a specific key
const clearCache = (key) => {
  cache.del(key);
};

// Function to clear all cache
const clearAllCache = () => {
  cache.flushAll();
};

module.exports = { cacheMiddleware, clearCache, clearAllCache };