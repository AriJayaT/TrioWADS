import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Simple in-memory cache for user data to reduce database queries
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL (reduced from 10 minutes)

// Request throttling to prevent excessive auth checks from same user
const authThrottle = new Map();
const THROTTLE_WINDOW = 5000; // 5 seconds window
const MAX_AUTH_REQUESTS = 10; // Max 10 auth requests per window per user

// Clean up expired cache entries and throttle data periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean user cache
  for (const [key, value] of userCache.entries()) {
    if (now > value.expiresAt) {
      userCache.delete(key);
    }
  }
  
  // Clean throttle data
  for (const [key, value] of authThrottle.entries()) {
    if (now > value.windowEnd) {
      authThrottle.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Check if request should be throttled
 */
const shouldThrottle = (userId, req) => {
  // Skip throttling for critical endpoints and agent dashboard functionality
  const criticalPaths = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/me',
    '/api/tickets/agent/stats',  // Agent dashboard stats
    '/api/tickets',              // Ticket listing
    '/api/notifications',        // Notifications
    '/api/users'                 // User endpoints
  ];
  
  // Also skip throttling for any GET requests to reduce interference
  if (req.method === 'GET') {
    return false;
  }
  
  if (criticalPaths.some(path => req.path.includes(path))) {
    return false;
  }

  const now = Date.now();
  const key = userId;
  const throttleData = authThrottle.get(key);

  if (!throttleData) {
    // First request in window
    authThrottle.set(key, {
      count: 1,
      windowStart: now,
      windowEnd: now + THROTTLE_WINDOW
    });
    return false;
  }

  if (now > throttleData.windowEnd) {
    // Window expired, reset
    authThrottle.set(key, {
      count: 1,
      windowStart: now,
      windowEnd: now + THROTTLE_WINDOW
    });
    return false;
  }

  // Within window - be more lenient
  throttleData.count++;
  if (throttleData.count > (MAX_AUTH_REQUESTS * 2)) { // Double the limit to be less restrictive
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth] Throttling user ${userId} - ${throttleData.count} requests in window`);
    }
    return true;
  }

  return false;
};

/**
 * Middleware to protect routes by verifying JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Only log for debugging if needed - reduce console spam
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Checking authorization header for path:', req.path);
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jellycatsecret');
      
      // Check if request should be throttled
      // Temporarily disabled to troubleshoot dashboard issues
      // if (shouldThrottle(decoded.id, req)) {
      //   return res.status(429).json({ error: 'Too many authentication requests' });
      // }
      
      // Check cache first to reduce database queries
      const cacheKey = decoded.id;
      const cached = userCache.get(cacheKey);
      
      let user;
      if (cached && Date.now() < cached.expiresAt) {
        // Use cached user data
        user = cached.user;
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Using cached user data for:', decoded.id);
        }
      } else {
        // Fetch from database and cache
        user = await User.findById(decoded.id);
      if (!user) {
        console.log('[Auth] User not found for ID:', decoded.id);
        return res.status(401).json({ error: 'User not found' });
      }

        // Cache the user data
        userCache.set(cacheKey, {
          user: user,
          expiresAt: Date.now() + CACHE_TTL
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Cached fresh user data for:', decoded.id);
        }
      }

      // Add user and role to request object
      req.user = user;
      req.userRole = decoded.role; // Use the role from the token

      next();
    } catch (err) {
      console.error('[Auth] Token verification error:', err);
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
  } catch (error) {
    console.error('[Auth] Auth middleware error:', error);
    res.status(500).json({ error: 'Server error in auth middleware' });
  }
};

/**
 * Middleware to restrict access to specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role ${req.user.role} is not authorized to access this resource`
      });
    }
    
    next();
  };
};

/**
 * Clear user cache entry (useful when user data is updated)
 */
export const clearUserCache = (userId) => {
  if (userCache.has(userId)) {
    userCache.delete(userId);
    console.log('[Auth] Cleared cache for user:', userId);
  }
};

/**
 * Clear all cache entries (useful for cache reset)
 */
export const clearAllCaches = () => {
  userCache.clear();
  authThrottle.clear();
  console.log('[Auth] Cleared all authentication caches');
};

/**
 * Get cache statistics (useful for monitoring)
 */
export const getCacheStats = () => {
  return {
    userCacheSize: userCache.size,
    throttleDataSize: authThrottle.size,
    cacheHitRatio: userCache.size > 0 ? 'Available' : 'N/A'
  };
}; 