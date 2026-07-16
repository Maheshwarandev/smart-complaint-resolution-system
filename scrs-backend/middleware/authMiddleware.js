// ─────────────────────────────────────────────────────────────────────────────
// middleware/authMiddleware.js — AUTHENTICATION & AUTHORISATION
//
// This file exports two middleware functions:
//
//   protect   → checks if the user is logged in (has a valid JWT token)
//   authorize → checks if the logged-in user has the right role
//
// Middleware is code that runs between the request arriving and the
// controller function handling it. Think of it as a security checkpoint.
// ─────────────────────────────────────────────────────────────────────────────

// jsonwebtoken lets us create and verify JWT (JSON Web Token) tokens.
// A JWT is a compact string that proves who a user is.
const jwt = require('jsonwebtoken');

// We import the User model so we can look up the user from the database
const User = require('../models/User');

// AppError is our custom error class — lets us send clean JSON error responses
const { AppError } = require('../utils/errorHandler');


// ─── protect MIDDLEWARE ───────────────────────────────────────────────────────
// This middleware runs on any route that requires the user to be logged in.
//
// How it works:
//   1. Look for a JWT token in the request headers
//   2. Verify the token is valid and not expired
//   3. Load the user from the database using the ID inside the token
//   4. Attach the user to req.user so the controller can use it
//   5. Call next() to move on to the controller
//
// If anything goes wrong at any step, we throw an AppError and the
// request is rejected with a 401 (Unauthorised) response.
const protect = async (req, res, next) => {
  try {
    // ── Step 1: Extract the token from the Authorization header ───────────────
    // Clients send tokens in the Authorization header like this:
    //   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    //
    // We check the header exists AND starts with "Bearer",
    // then split on the space and grab the second part (the actual token).
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      // Example: "Bearer abc123" → split → ["Bearer", "abc123"] → [1] = "abc123"
    }

    // If no token was found in the header, reject the request immediately
    if (!token) {
      throw new AppError('Not authorized, token missing', 401);
    }

    // ── Step 2: Verify the token ──────────────────────────────────────────────
    // jwt.verify() checks two things:
    //   a) The token was signed with our secret key (not a fake token)
    //   b) The token has not expired
    //
    // If verification succeeds, it returns the decoded payload.
    // When we created the token (in the controller), we put { id: user._id } inside.
    // So decoded.id = the user's MongoDB _id.
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // If the token is invalid or expired, jwt.verify throws an error.
      // We catch it here and throw our own AppError instead.
      throw new AppError('Not authorized, token invalid', 401);
    }

    // ── Step 3: Load the user from the database ───────────────────────────────
    // We use the ID from the token to find the user in MongoDB.
    // This confirms the user still exists (they might have been deleted).
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('Not authorized, user not found', 401);
    }

    // ── Step 4: Attach user to the request object ─────────────────────────────
    // req.user is now available in every controller that comes after this middleware.
    // Controllers can read req.user._id, req.user.role, req.user.name, etc.
    req.user = user;

    // ── Step 5: Continue to the next middleware or controller ─────────────────
    next();

  } catch (err) {
    // Any error (from the try block or from our throws) is passed to
    // Express's error handler via next(err)
    next(err);
  }
};


// ─── authorize MIDDLEWARE ─────────────────────────────────────────────────────
// This middleware checks if the logged-in user has the right role.
// It is always used AFTER protect (because protect sets req.user).
//
// authorize is a function that RETURNS a middleware function.
// This lets us pass in the allowed roles dynamically.
//
// Usage: authorize('admin', 'agent')
// This creates a middleware that only allows admins and agents through.
//
// Example in a route:
//   router.get('/stats', protect, authorize('admin', 'agent'), getStats);
const authorize = (...roles) => {
  // The ...roles syntax collects all arguments into an array.
  // authorize('admin', 'agent') → roles = ['admin', 'agent']

  // Return the actual middleware function
  return (req, res, next) => {
    // roles.includes(req.user.role) checks if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      // User's role is not allowed — reject with 403 Forbidden
      throw new AppError('Not authorized to access this route', 403);
    }
    // Role is allowed — continue
    next();
  };
};


// Export both middleware functions
module.exports = {
  protect,
  authorize,
};
