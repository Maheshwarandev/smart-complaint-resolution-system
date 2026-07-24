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

const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

// ─── PROTECTED ROUTES ─────────────────────────────────────────────────────────
router.get('/me', protect, asyncHandler(getMe));
router.put('/profile', protect, upload.single('avatar'), asyncHandler(updateProfile));

module.exports = router;
