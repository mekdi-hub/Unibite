import axios from 'axios'
import { apiCache } from './apiCache'

// Create optimized axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * GET request with caching
 * @param {string} url - API endpoint
 * @param {object} config - Axios config
 * @param {number} cacheTime - Cache duration in milliseconds (0 = no cache)
 */
export async function cachedGet(url, config = {}, cacheTime = 5 * 60 * 1000) {
  // Skip cache if cacheTime is 0 or method is not GET
  if (cacheTime === 0) {
    return api.get(url, config)
  }

  const cacheKey = `${url}${JSON.stringify(config.params || {})}`
  
  // Try cache first
  const cached = apiCache.get(cacheKey, cacheTime)
  if (cached) {
    return { data: cached, fromCache: true }
  }

  // Fetch from API
  const response = await api.get(url, config)
  
  // Cache successful responses
  if (response.data) {
    apiCache.set(cacheKey, response.data)
  }
  
  return response
}

/**
 * POST request (no caching)
 */
export function post(url, data, config = {}) {
  return api.post(url, data, config)
}

/**
 * PUT request (no caching, clears related cache)
 */
export function put(url, data, config = {}) {
  // Clear cache for this resource
  const resourceType = url.split('/')[2] // Extract resource type from URL
  if (resourceType) {
    apiCache.clearPattern(new RegExp(`^${resourceType}`))
  }
  return api.put(url, data, config)
}

/**
 * DELETE request (no caching, clears related cache)
 */
export function del(url, config = {}) {
  // Clear cache for this resource
  const resourceType = url.split('/')[2]
  if (resourceType) {
    apiCache.clearPattern(new RegExp(`^${resourceType}`))
  }
  return api.delete(url, config)
}

export default api
