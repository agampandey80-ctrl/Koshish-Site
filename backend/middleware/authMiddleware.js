/**
 * JWT Authentication Middleware
 * Verifies Bearer token from the Authorization header.
 * On success, attaches decoded payload to req.admin.
 */

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];
  let decoded=null
  try {
     decoded = jwt.verify(token, process.env.JWT_SECRET || 'koshish_default_jwt_secret_key_2025');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please log in again.',
    });
  }
}

module.exports = authMiddleware;
