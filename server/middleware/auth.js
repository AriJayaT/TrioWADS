import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes by verifying JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jellycatsecret');
    console.log('Decoded token:', decoded);

    // Add user from payload to request object
    req.user = {
      _id: decoded.id, // Add _id for MongoDB queries
      id: decoded.id,
      role: decoded.role
    };

    console.log('User set in request:', req.user);
    return next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Not authorized, token failed' });
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
