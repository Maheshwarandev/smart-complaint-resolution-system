const express = require('express');
const {
  getDashboard,
  getAllUsers,
  getAllAgents,
  updateUserRole,
  assignComplaint,
  generateAgentSecurityCode,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', asyncHandler(getDashboard));
router.get('/users', asyncHandler(getAllUsers));
router.get('/agents', asyncHandler(getAllAgents));
router.put('/users/:id/role', asyncHandler(updateUserRole));
router.post('/agents/:id/generate-code', asyncHandler(generateAgentSecurityCode));
router.delete('/users/:id', asyncHandler(deleteUser));
router.put('/complaints/:id/assign', asyncHandler(assignComplaint));

module.exports = router;
