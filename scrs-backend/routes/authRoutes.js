// ─────────────────────────────────────────────────────────────────────────────
// routes/authRoutes.js — AUTHENTICATION ROUTES
//
// This file maps specific URLs to the correct controller functions.
// Think of routes as a table of contents — they say:
//   "When a request comes to THIS URL, call THAT function."
//
// These routes are mounted in app.js at '/api/auth', so:
//   POST /register here → full URL is POST /api/auth/register
//   POST /login    here → full URL is POST /api/auth/login
//   GET  /me       here → full URL is GET  /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const rateLimit = require('express-rate-limit');

// Import the controller functions that handle the actual logic
// register → creates a new user
// login    → authenticates an existing user
// getMe    → returns the currently logged-in user's data
const { register, login, getMe } = require('../controllers/authController');

// protect is middleware that checks if the user is logged in
// GET /me is a protected route — you must send a token to access it
const { protect } = require('../middleware/authMiddleware');

// asyncHandler wraps async functions so errors are caught and forwarded
// to Express's error handler automatically
const asyncHandler = require('../utils/asyncHandler');

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
// Prevent brute force attacks on login and registration endpoints
// DISABLED FOR DEVELOPMENT - Enable in production

// Allow 5 login attempts per IP per 15 minutes
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5,                    // max 5 attempts per window
//   message: 'Too many login attempts, please try again later',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Allow 3 registrations per IP per hour
// const registerLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000,  // 1 hour
//   max: 3,                    // max 3 registrations per hour
//   message: 'Too many accounts created, please try again later',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Create a mini router for authentication routes
const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
// These routes do NOT require the user to be logged in.
// Anyone can register or login — no token needed.

// POST /api/auth/register → runs the register controller
router.post('/register', asyncHandler(register));

// POST /api/auth/login → runs the login controller
router.post('/login', asyncHandler(login));

// ─── PROTECTED ROUTES ─────────────────────────────────────────────────────────
// This route DOES require the user to be logged in.
// protect runs first — if the user has no valid token, it rejects the request.
// If protect passes, getMe runs and returns the user's profile.

// GET /api/auth/me → first runs protect, then runs getMe
router.get('/me', protect, asyncHandler(getMe));

// Export the router so app.js can mount it
module.exports = router;
