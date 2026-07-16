// ─────────────────────────────────────────────────────────────────────────────
// routes/complaintRoutes.js — COMPLAINT ROUTES
//
// This file maps complaint URLs to their controller functions.
// It is mounted in app.js at '/api/complaints', so:
//   '/'     in this file = '/api/complaints'
//   '/:id'  in this file = '/api/complaints/:id'  (:id is a URL parameter)
//
// ALL routes in this file require the user to be logged in.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');

// Import all 6 complaint controller functions
// Each one handles a specific action
const {
  createComplaint,    // creates a new complaint
  getAllComplaints,    // lists complaints (filtered by role)
  getComplaintById,   // returns one specific complaint
  updateComplaint,    // edits a complaint (role-restricted fields)
  deleteComplaint,    // deletes a complaint (role-restricted)
  getComplaintStats,  // returns complaint counts grouped by status
} = require('../controllers/complaintController');

// protect   → middleware that checks the user is logged in
// authorize → middleware that checks the user has the right role
const { protect, authorize } = require('../middleware/authMiddleware');

// asyncHandler → wraps async functions to catch errors automatically
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middleware/uploadMiddleware');

// Create the complaint router
const router = express.Router();

// ─── PROTECT ALL ROUTES ────────────────────────────────────────────────────────
// router.use(protect) applies the protect middleware to EVERY route below.
// This means every complaint URL requires the user to be logged in.
// This is cleaner than writing 'protect' on every single route individually.
// If the request has no valid token, it is rejected here with a 401 error.
router.use(protect);

// ─── STATS ROUTE ──────────────────────────────────────────────────────────────
// GET /api/complaints/stats
//
// ⚠️  IMPORTANT ORDER RULE — this MUST come before the /:id route below.
//
// Here is why:
//   Express reads routes from top to bottom and matches the first one it finds.
//   If /:id came first, a request to /stats would match /:id with id = "stats".
//   The controller would then call Complaint.findById("stats").
//   MongoDB would crash with a CastError because "stats" is not a valid ID.
//   By defining /stats FIRST, Express matches it correctly before reaching /:id.
//
// authorize('admin', 'agent') means only admins and agents can see stats.
// Regular users are blocked with a 403 Forbidden error.
router.get(
  '/stats',
  authorize('admin', 'agent'),
  asyncHandler(getComplaintStats)
);

// ─── LIST & CREATE ROUTES ─────────────────────────────────────────────────────
// router.route('/') groups multiple HTTP methods for the same URL path.
// This avoids repeating router.get('/') and router.post('/') separately.
//
//   GET  /api/complaints → getAllComplaints (list complaints)
//   POST /api/complaints → createComplaint (file a new complaint)
router
  .route('/')
  .get(asyncHandler(getAllComplaints))
  .post(upload.array('attachments', 5), asyncHandler(createComplaint));

// ─── SINGLE COMPLAINT ROUTES ──────────────────────────────────────────────────
// :id is a URL parameter — it captures whatever comes after the slash.
// Example: /api/complaints/64f3c1a2b5e8 → req.params.id = "64f3c1a2b5e8"
//
// We chain 3 methods on the same /:id path — cleaner than 3 separate lines.
//
//   GET    /api/complaints/:id → getComplaintById  (view one complaint)
//   PUT    /api/complaints/:id → updateComplaint   (edit one complaint)
//   DELETE /api/complaints/:id → deleteComplaint   (delete one complaint)
router
  .route('/:id')
  .get(asyncHandler(getComplaintById))
  .put(asyncHandler(updateComplaint))
  .delete(asyncHandler(deleteComplaint));

// Export the router so app.js can mount it at /api/complaints
module.exports = router;
