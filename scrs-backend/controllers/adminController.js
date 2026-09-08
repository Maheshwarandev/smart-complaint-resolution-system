const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { AppError } = require('../utils/errorHandler');
const { ROLES, COMPLAINT_STATUS } = require('../utils/constants');

/** GET /api/admin/dashboard — system-wide stats */
const getDashboard = async (req, res) => {
  const [
    totalUsers,
    totalAgents,
    totalComplaints,
    openComplaints,
    inProgressComplaints,
    resolvedComplaints,
    closedComplaints,
    complaintsByStatus,
    complaintsByCategory,
    recentComplaints,
    slaBreachedCount,
    ratingStats,
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.USER }),
    User.countDocuments({ role: ROLES.AGENT }),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.OPEN }),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.IN_PROGRESS }),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.RESOLVED }),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.CLOSED }),
    Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Complaint.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5),
    Complaint.countDocuments({ slaBreached: true }),
    Complaint.aggregate([
      { $match: { 'rating.score': { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$rating.score' }, totalRatings: { $sum: 1 } } },
    ]),
  ]);

  const avgRating = ratingStats.length > 0 ? Number(ratingStats[0].avgScore.toFixed(1)) : 0;
  const totalRatings = ratingStats.length > 0 ? ratingStats[0].totalRatings : 0;

  res.status(200).json({
    success: true,
    data: {
      dashboard: {
        summary: { totalUsers, totalAgents, totalComplaints, slaBreachedCount, avgRating, totalRatings },
        complaintsByStatus,
        complaintsByCategory,
        recentComplaints,
      },
    },
  });
};

/** GET /api/admin/users — list all regular users with complaint counts */
const getAllUsers = async (req, res) => {
  const users = await User.aggregate([
    { $match: { role: ROLES.USER } },
    {
      $lookup: {
        from: 'complaints',
        localField: '_id',
        foreignField: 'user',
        as: 'userComplaints'
      }
    },
    { $addFields: { complaintCount: { $size: '$userComplaints' } } },
    { $project: { userComplaints: 0 } },
    { $sort: { createdAt: -1 } }
  ]);

  res.status(200).json({ success: true, count: users.length, users });
};

/** GET /api/admin/agents — list all agents with complaint counts */
const getAllAgents = async (req, res) => {
  const agents = await User.aggregate([
    { $match: { role: ROLES.AGENT } },
    {
      $lookup: {
        from: 'complaints',
        localField: '_id',
        foreignField: 'assignedTo',
        as: 'assignedComplaints'
      }
    },
    { $addFields: { complaintCount: { $size: '$assignedComplaints' } } },
    { $project: { assignedComplaints: 0 } },
    { $sort: { createdAt: -1 } }
  ]);

  res.status(200).json({ success: true, count: agents.length, agents });
};

/** PUT /api/admin/users/:id/role — change a user's role */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowedRoles = Object.values(ROLES);
  if (!role || !allowedRoles.includes(role)) {
    throw new AppError(`Role must be one of: ${allowedRoles.join(', ')}`, 400);
  }

  if (id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User role updated to '${role}' successfully`,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

/** PUT /api/admin/complaints/:id/assign — assign complaint to agent */
const assignComplaint = async (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (!agentId) {
    throw new AppError('Please provide an agentId in the request body', 400);
  }

  const agent = await User.findById(agentId);
  if (!agent) throw new AppError('Agent not found', 404);
  if (agent.role !== ROLES.AGENT) {
    throw new AppError('The provided ID does not belong to an agent', 400);
  }

  const complaint = await Complaint.findById(id);
  if (!complaint) throw new AppError('Complaint not found', 404);

  complaint.assignedTo = agentId;
  complaint.status = 'In Progress';
  await complaint.save();
  await complaint.populate('assignedTo', 'name email');

  res.status(200).json({
    success: true,
    message: 'Complaint assigned to agent successfully',
    complaint,
  });
};

/** POST /api/admin/agents/:id/generate-code — generate agent security code */
const generateAgentSecurityCode = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== ROLES.AGENT) {
    throw new AppError('This user is not an agent', 400);
  }

  const securityCode = User.generateSecurityCode();
  user.agentSecurityCode = securityCode;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Security code generated for agent ${user.name}`,
    agentName: user.name,
    agentEmail: user.email,
    securityCode,
  });
};

/** DELETE /api/admin/users/:id — delete user and their complaints */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);

  const deletedComplaints = await Complaint.deleteMany({ user: id });
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: `User '${user.name}' and their ${deletedComplaints.deletedCount} complaint(s) have been deleted`,
  });
};

module.exports = {
  getDashboard,
  getAllUsers,
  getAllAgents,
  updateUserRole,
  assignComplaint,
  generateAgentSecurityCode,
  deleteUser,
};
