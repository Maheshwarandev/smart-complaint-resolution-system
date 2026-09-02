const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

/**
 * Protect routes — verify JWT token and attach user to req.
 * Expects header: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized, token missing', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new AppError('Not authorized, token invalid', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('Not authorized, user not found', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Authorize by role — must be used after protect middleware.
 * Usage: authorize('admin', 'agent')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('Not authorized to access this route', 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
