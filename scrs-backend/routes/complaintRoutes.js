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
  getAllComplaints,   // lists complaints (filtered by role)
  getComplaintById,   // returns one specific complaint
  updateComplaint,    // edits a complaint (role-restricted fields)
  deleteComplaint,    // deletes a complaint (role-restricted)
  getComplaintStats,  // returns complaint counts grouped by status
  addComment,         // adds a comment to complaint thread
  rateComplaint,      // submits star rating & feedback for complaint
} = require('../controllers/complaintController');

const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get(
  '/stats',
  authorize('admin', 'agent'),
  asyncHandler(getComplaintStats)
);

router
  .route('/')
  .get(asyncHandler(getAllComplaints))
  .post(upload.array('attachments', 5), asyncHandler(createComplaint));

router
  .route('/:id')
  .get(asyncHandler(getComplaintById))
  .put(asyncHandler(updateComplaint))
  .delete(asyncHandler(deleteComplaint));

router.post('/:id/comments', asyncHandler(addComment));
router.post('/:id/rate', asyncHandler(rateComplaint));

module.exports = router;
