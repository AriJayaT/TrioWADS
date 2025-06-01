import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes by verifying JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    console.log('[Auth] Checking authorization header:', req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('[Auth] No token provided');
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jellycatsecret');
      console.log('[Auth] Token decoded successfully:', { id: decoded.id, role: decoded.role });

      // Get user from the token
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('[Auth] User not found for ID:', decoded.id);
        return res.status(401).json({ error: 'User not found' });
      }

      console.log('[Auth] User authenticated successfully:', { id: user._id, username: user.username, role: user.role });

      // Add user and role to request object
      req.user = user;
      req.userRole = decoded.role; // Use the role from the token
      console.log('[Auth] req.user:', req.user ? { id: req.user.id, email: req.user.email, role: req.user.role } : null);

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