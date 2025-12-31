import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT access tokens
 * Adds decoded user data to req.user if token is valid
 */
export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'No token provided in Authorization header'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Access token has expired. Please refresh your token.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or malformed.'
      });
    }

    return res.status(500).json({ 
      error: 'Token verification failed',
      message: error.message
    });
  }
};
