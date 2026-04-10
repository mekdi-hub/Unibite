/**
 * Simple in-memory cache for API responses
 * Improves performance by caching frequently accessed data
 */

class APICache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  /**

   * Get cached data if it exists and hasn't expired
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   * @returns {any|null} Cached data or null
   */

  get(key, maxAge = 5 * 60 * 1000) {
    if (!this.cache.has(key)) {
      return null
    }
    const timestamp = this.timestamps.get(key)
    const now = Date.now()

    // Check if cache has expired
    if (now - timestamp > maxAge) {
      this.cache.delete(key)
      this.timestamps.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  set(key, data) {
    this.cache.set(key, data)
    this.timestamps.set(key, Date.now())
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    this.cache.clear()
    this.timestamps.clear()
  }

  /**
   * Clear cache entries matching a pattern
   * @param {RegExp} pattern - Pattern to match keys
   */
  clearPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        this.timestamps.delete(key)
      }
    }
  }
}

// Export singleton instance
export const apiCache = new APICache()

/**
 * Cached fetch wrapper
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function that returns a promise
 * @param {number} maxAge - Maximum cache age in milliseconds
 * @returns {Promise<any>}
 */
export async function cachedFetch(key, fetchFn, maxAge = 5 * 60 * 1000) {
  // Try to get from cache first
  const cached = apiCache.get(key, maxAge)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetchFn()
  
  // Cache the result
  apiCache.set(key, data)
  
  return data
}

/**
 * Clear cache for specific resource types
 */
export const clearCacheFor = {
  restaurants: () => apiCache.clearPattern(/^restaurants/),
  orders: () => apiCache.clearPattern(/^orders/),
  notifications: () => apiCache.clearPattern(/^notifications/),
  menu: () => apiCache.clearPattern(/^menu/),
  deliveries: () => apiCache.clearPattern(/^deliveries/),
  all: () => apiCache.clearAll()
}
