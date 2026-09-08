const express = require('express');
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  addComment,
  rateComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const { ROLES } = require('../utils/constants');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', authorize(ROLES.ADMIN, ROLES.AGENT), asyncHandler(getComplaintStats));

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
