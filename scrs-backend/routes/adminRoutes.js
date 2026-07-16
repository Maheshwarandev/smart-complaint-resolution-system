// ─────────────────────────────────────────────────────────────────────────────
// routes/adminRoutes.js — ADMIN ROUTES
//
// This file maps admin-only URLs to their controller functions.
// It is mounted in app.js at '/api/admin', so:
//   '/dashboard'            in this file = '/api/admin/dashboard'
//   '/users'                in this file = '/api/admin/users'
//   '/users/:id/role'       in this file = '/api/admin/users/:id/role'
//   '/complaints/:id/assign' in this file = '/api/admin/complaints/:id/assign'
//
// ─── AUTHORIZATION STRATEGY ──────────────────────────────────────────────────
//
// ALL routes in this file are protected by TWO middleware layers:
//
//   1. protect   → checks the user is logged in (has a valid JWT token)
//                  sets req.user so controllers know who is making the request
//
//   2. authorize('admin') → checks that the logged-in user has role === 'admin'
//                           if not, rejects with 403 Forbidden
//
// Both are applied once at the top using router.use() so we don't have
// to repeat them on every single route. This is cleaner and safer —
// any new route added below is automatically protected.
//
// HOW RBAC WORKS HERE:
//   A regular user logs in → gets a token → calls GET /api/admin/dashboard
//   protect runs → token is valid, req.user is set
//   authorize('admin') runs → req.user.role === 'user' → 403 Forbidden
//   The controller never even runs.
//
//   An admin logs in → gets a token → calls GET /api/admin/dashboard
//   protect runs → token is valid, req.user is set
//   authorize('admin') runs → req.user.role === 'admin' → passes ✅
//   getDashboard controller runs → returns JSON
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');

// Import all 7 admin controller functions
const {
  getDashboard,       // returns system-wide stats for the admin panel
  getAllUsers,         // lists all regular users
  getAllAgents,        // lists all agents (useful when assigning complaints)
  updateUserRole,     // changes a user's role (e.g. user → agent)
  assignComplaint,    // assigns a complaint to a specific agent
  generateAgentSecurityCode, // generates a security code for an agent
  deleteUser,         // removes a user and their complaints from the system
} = require('../controllers/adminController');

// protect   → checks JWT token, sets req.user
// authorize → checks req.user.role
const { protect, authorize } = require('../middleware/authMiddleware');

// asyncHandler → wraps async functions so errors are caught automatically
// Without this, any error thrown inside an async controller would cause
// Express to hang (not send a response) — asyncHandler fixes that.
const asyncHandler = require('../utils/asyncHandler');

// Import system constants
const { ROLES } = require('../utils/constants');

// Create the admin router
const router = express.Router();

// ─── PROTECT ALL ROUTES ───────────────────────────────────────────────────────
// router.use() applies middleware to EVERY route defined below in this file.
//
// ORDER MATTERS:
//   protect must run before authorize
//   because authorize reads req.user which protect sets.
//   If authorize ran first, req.user would be undefined and it would crash.
//
// router.use(protect) → every admin route requires a valid JWT token
// router.use(authorize('admin')) → every admin route requires role === 'admin'
//
// This is cleaner than writing protect, authorize('admin') on every single route.
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// ─── DASHBOARD ROUTE ──────────────────────────────────────────────────────────
// GET /api/admin/dashboard
//
// Returns system summary: total users, agents, complaints, and status breakdown.
// Admins see this when they first open the admin panel.
router.get('/dashboard', asyncHandler(getDashboard));

// ─── USER MANAGEMENT ROUTES ───────────────────────────────────────────────────

// GET /api/admin/users
// Returns all users with role === 'user' (not agents or admins)
router.get('/users', asyncHandler(getAllUsers));

// GET /api/admin/agents
// Returns all users with role === 'agent'
// Useful when the admin wants to pick an agent to assign a complaint to
router.get('/agents', asyncHandler(getAllAgents));

// PUT /api/admin/users/:id/role
// Changes the role of a specific user by their MongoDB _id
// Example body: { "role": "agent" }
// :id is a URL parameter — it captures the user ID from the URL
router.put('/users/:id/role', asyncHandler(updateUserRole));

// POST /api/admin/agents/:id/generate-code
// Generates a new security code for an agent
// The admin gets the code and shares it with the agent
// :id is the MongoDB _id of the agent
router.post('/agents/:id/generate-code', asyncHandler(generateAgentSecurityCode));

// DELETE /api/admin/users/:id
// Deletes a user and ALL of their complaints from the database
// :id is the MongoDB _id of the user to delete
router.delete('/users/:id', asyncHandler(deleteUser));

// ─── COMPLAINT ASSIGNMENT ROUTE ───────────────────────────────────────────────
// PUT /api/admin/complaints/:id/assign
// Assigns a specific complaint to an agent
// Example body: { "agentId": "64f3c1a2b5e8..." }
// :id is the MongoDB _id of the complaint to assign
router.put('/complaints/:id/assign', asyncHandler(assignComplaint));

// Export the router so app.js can mount it at /api/admin
module.exports = router;
