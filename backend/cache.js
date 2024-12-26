// cache.js

// This object will store results keyed by a string, e.g. "ingredients:tomato,onion"
const cacheStore = {};

/**
 * Set a value in the cache
 * @param {string} key
 * @param {*} value
 * @param {number} ttl - time-to-live in milliseconds
 */
function setCache(key, value, ttl = 60000) { // default 60 seconds
  const record = {
    data: value,
    expiresAt: Date.now() + ttl
  };
  cacheStore[key] = record;
}

/**
 * Get a value from the cache
 * @param {string} key
 * @returns {*} value or null if expired/not found
 */
function getCache(key) {
  const record = cacheStore[key];
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    // expired
    delete cacheStore[key];
    return null;
  }
  return record.data;
}

module.exports = { setCache, getCache };
