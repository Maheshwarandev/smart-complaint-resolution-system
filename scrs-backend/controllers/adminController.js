// ─────────────────────────────────────────────────────────────────────────────
// controllers/adminController.js — ADMIN BUSINESS LOGIC
//
// This file contains all the logic for admin-only operations.
// Only users with role === 'admin' can reach any function here.
// That restriction is enforced in adminRoutes.js using protect + authorize('admin').
//
// The 6 functions in this file:
//   getDashboard       → GET    /api/admin/dashboard
//   getAllUsers        → GET    /api/admin/users
//   getAllAgents       → GET    /api/admin/agents
//   updateUserRole     → PUT    /api/admin/users/:id/role
//   assignComplaint    → PUT    /api/admin/complaints/:id/assign
//   deleteUser         → DELETE /api/admin/users/:id
//
// WHY a separate file instead of putting admin logic in authController or complaintController?
//   Each controller has one clear responsibility.
//   Mixing admin logic into other controllers would make them long and confusing.
//   Keeping admin logic here makes it easy to find, understand, and maintain.
// ─────────────────────────────────────────────────────────────────────────────

// Import the User model — lets us query the 'users' collection in MongoDB
const User = require('../models/User');

// Import the Complaint model — lets us query the 'complaints' collection in MongoDB
const Complaint = require('../models/Complaint');

// AppError is our custom error class — lets us throw clean JSON errors with a status code
const { AppError } = require('../utils/errorHandler');

// Import system constants
const { ROLES, COMPLAINT_STATUS } = require('../utils/constants');


// ─── 1. getDashboard ─────────────────────────────────────────────────────────
// Handles: GET /api/admin/dashboard
// Who can use it: admin only
//
// WHY this function exists:
//   An admin needs a quick overview of the system without checking every
//   collection manually. This function gathers key numbers in one place:
//   total users, total agents, and complaint counts by status.
//
// HOW it works step by step:
//   1. Count all documents in the User collection where role === 'user'
//   2. Count all documents in the User collection where role === 'agent'
//   3. Count all documents in the Complaint collection (any status)
//   4. Count complaints where status === 'Open'
//   5. Count complaints where status === 'In Progress'
//   6. Count complaints where status === 'Resolved'
//   7. Return all counts in a single JSON response
//
// WHY we use Promise.all()?
//   Each countDocuments() call goes to MongoDB separately.
//   If we awaited them one by one, we'd wait for each query to finish
//   before starting the next — slow and unnecessary.
//   Promise.all() runs ALL queries at the same time (in parallel) and waits
//   for all of them to complete together. Much faster.
const getDashboard = async (req, res) => {
  // Run all queries in parallel using Promise.all()
  const [
    totalUsers,       // number of users with role 'user'
    totalAgents,      // number of users with role 'agent'
    totalComplaints,  // total complaints regardless of status
    openComplaints,   // complaints currently open
    inProgressComplaints, // complaints currently being worked on
    resolvedComplaints,   // complaints that have been resolved
    closedComplaints,     // complaints that are closed
    complaintsByStatus,   // aggregated: count complaints by status
    complaintsByCategory, // aggregated: count complaints by category
    recentComplaints,     // last 5 complaints with user info
  ] = await Promise.all([
    // Simple counts
    User.countDocuments({ role: ROLES.USER }),
    User.countDocuments({ role: ROLES.AGENT }),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.OPEN }),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.IN_PROGRESS }),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.RESOLVED }),
    Complaint.countDocuments({ status: COMPLAINT_STATUS.CLOSED }),
    
    // Aggregation: count by status
    Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    
    // Aggregation: count by category
    Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    
    // Get recent complaints with user info
    Complaint.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  // Return all the data in the format the frontend expects
  res.status(200).json({
    success: true,
    data: {
      dashboard: {
        summary: {
          totalUsers,
          totalAgents,
          totalComplaints,
        },
        complaintsByStatus,   // array of { _id: status, count: number }
        complaintsByCategory, // array of { _id: category, count: number }
        recentComplaints,     // array of complaint documents
      },
    },
  });
};


// ─── 2. getAllUsers ───────────────────────────────────────────────────────────
// Handles: GET /api/admin/users
// Who can use it: admin only
//
// WHY this function exists:
//   Admins need to see all registered users in the system
//   to manage them — promote them to agent, delete them, etc.
//
// HOW it works:
//   Find all User documents where role === 'user'.
//   We deliberately exclude 'agent' and 'admin' from this list
//   because those have their own dedicated endpoint (getAllAgents).
//   Sort by createdAt descending so newest users appear first.
const getAllUsers = async (req, res) => {
  // Find only regular users — not agents or admins
  // This keeps the list focused: "show me all regular users"
  // Use aggregation pipeline to join with complaints and get count
  const users = await User.aggregate([
    { $match: { role: 'user' } },
    {
      $lookup: {
        from: 'complaints',
        localField: '_id',
        foreignField: 'user',
        as: 'userComplaints'
      }
    },
    {
      $addFields: {
        complaintCount: { $size: '$userComplaints' }
      }
    },
    { $project: { userComplaints: 0 } }, // remove the array, keep only count
    { $sort: { createdAt: -1 } }
  ]);

  res.status(200).json({
    success: true,
    count: users.length, // how many users were found
    users,
  });
};


// ─── 3. getAllAgents ──────────────────────────────────────────────────────────
// Handles: GET /api/admin/agents
// Who can use it: admin only
//
// WHY this function exists:
//   When an admin wants to assign a complaint to an agent,
//   they need a list of available agents and their IDs.
//   This endpoint provides exactly that.
//
// HOW it works:
//   Find all User documents where role === 'agent'.
//   Sort by createdAt descending so newest agents appear first.
const getAllAgents = async (req, res) => {
  // Find only agents — not regular users or admins
  // Use aggregation pipeline to join with complaints and get count
  const agents = await User.aggregate([
    { $match: { role: 'agent' } },
    {
      $lookup: {
        from: 'complaints',
        localField: '_id',
        foreignField: 'assignedTo',
        as: 'assignedComplaints'
      }
    },
    {
      $addFields: {
        complaintCount: { $size: '$assignedComplaints' }
      }
    },
    { $project: { assignedComplaints: 0 } }, // remove the array, keep only count
    { $sort: { createdAt: -1 } }
  ]);

  res.status(200).json({
    success: true,
    count: agents.length,
    agents,
  });
};


// ─── 4. updateUserRole ───────────────────────────────────────────────────────
// Handles: PUT /api/admin/users/:id/role
// Who can use it: admin only
//
// WHY this function exists:
//   An admin needs to promote users to agents (or agents to admins).
//   This is the core of Role-Based Access Control (RBAC) management.
//   Without this, all users would stay as 'user' forever.
//
// RBAC EXPLANATION:
//   RBAC = Role-Based Access Control
//   The idea: users have roles (user, agent, admin).
//   Each role has different permissions.
//   This function lets an admin change what a user can do
//   by changing their role.
//
// HOW it works step by step:
//   1. Read the target user's ID from the URL (:id)
//   2. Read the new role from the request body
//   3. Validate the role is one of the allowed values
//   4. Make sure admin doesn't accidentally demote themselves
//   5. Find the user in the database
//   6. Update and save the role
const updateUserRole = async (req, res) => {
  // req.params.id = the user ID from the URL
  // Example: PUT /api/admin/users/64f3c1a2b5e8.../role → req.params.id = "64f3c1a2..."
  const { id } = req.params;

  // The new role comes from the request body
  // Example body: { "role": "agent" }
  const { role } = req.body;

  // ── Validation: role must be one of the allowed values ────────────────────
  // We check manually here because the Mongoose model's enum would only
  // catch it at save time — we want a clear error before that.
  const allowedRoles = Object.values(ROLES);
  if (!role || !allowedRoles.includes(role)) {
    throw new AppError(`Role must be one of: ${allowedRoles.join(', ')}`, 400);
  }

  // ── Safety check: prevent admin from changing their OWN role ──────────────
  // WHY? If an admin accidentally demotes themselves to 'user',
  // they lose all admin access and cannot fix it themselves.
  // We compare as strings using .toString() because MongoDB IDs are objects,
  // not strings — direct === comparison would always return false.
  if (id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  // ── Find the user by their MongoDB _id ────────────────────────────────────
  const user = await User.findById(id);

  // If no user exists with that ID, return a 404 error
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // ── Update the role and save ──────────────────────────────────────────────
  // We assign the new role directly and call .save() so Mongoose
  // validates the value against the enum in the schema before saving.
  user.role = role;

  // WHY .save() instead of findByIdAndUpdate()?
  //   .save() runs the schema validators (like enum check).
  //   findByIdAndUpdate() skips validators by default — risky for enum fields.
  await user.save();

  res.status(200).json({
    success: true,
    message: `User role updated to '${role}' successfully`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // show the new role in the response
    },
  });
};


// ─── 5. assignComplaint ──────────────────────────────────────────────────────
// Handles: PUT /api/admin/complaints/:id/assign
// Who can use it: admin only
//
// WHY this function exists:
//   When a complaint comes in, it starts as 'Open' with no agent.
//   An admin reviews it and assigns it to the right agent.
//   This is the complaint assignment workflow — a core admin task.
//
// HOW it works step by step:
//   1. Read the complaint ID from the URL (:id)
//   2. Read the agentId from the request body
//   3. Validate that the agentId was provided
//   4. Confirm the agent exists AND is actually an agent (not a regular user)
//   5. Find the complaint
//   6. Set assignedTo = agentId and update status to 'In Progress'
//   7. Save the complaint
//
// WHY we also set status to 'In Progress'?
//   Once a complaint is assigned to an agent, it means someone is
//   actively working on it. The status should reflect this automatically.
//   This avoids the admin needing to do two separate updates.
const assignComplaint = async (req, res) => {
  // req.params.id = the complaint ID from the URL
  const { id } = req.params;

  // agentId = the MongoDB _id of the agent we want to assign this complaint to
  const { agentId } = req.body;

  // ── Validate: agentId must be provided in the body ────────────────────────
  if (!agentId) {
    throw new AppError('Please provide an agentId in the request body', 400);
  }

  // ── Confirm the agent exists and has the 'agent' role ─────────────────────
  // WHY check the role?
  //   We don't want to assign a complaint to a regular user or another admin.
  //   The agentId must belong to a real agent in the system.
  const agent = await User.findById(agentId);

  if (!agent) {
    throw new AppError('Agent not found', 404);
  }

  if (agent.role !== 'agent') {
    // The user exists but their role is not 'agent' — block the assignment
    throw new AppError('The provided ID does not belong to an agent', 400);
  }

  // ── Find the complaint that needs to be assigned ───────────────────────────
  const complaint = await Complaint.findById(id);

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // ── Assign the agent and update the status ────────────────────────────────
  complaint.assignedTo = agentId; // link the agent's ObjectId to this complaint
  complaint.status = 'In Progress'; // mark the complaint as being handled

  // Save the updated complaint — runs validators and timestamps updatedAt
  await complaint.save();

  // Populate the assignedTo field so the response shows name + email
  // instead of just the raw ObjectId
  await complaint.populate('assignedTo', 'name email');

  res.status(200).json({
    success: true,
    message: 'Complaint assigned to agent successfully',
    complaint,
  });
};



// ─── 6. generateAgentSecurityCode ───────────────────────────────────────────
// Handles: POST /api/admin/agents/:id/generate-code
// Who can use it: admin only
//
// WHY this function exists:
//   When an admin wants to create or reset an agent's security code,
//   they call this endpoint. It generates a random 6-character code
//   that the agent will use when logging in.
//
// HOW it works step by step:
//   1. Read the agent ID from the URL (:id)
//   2. Confirm the user exists and is actually an agent
//   3. Generate a random security code using User.generateSecurityCode()
//   4. Save the code to the agent's agentSecurityCode field
//   5. Return the code to the admin (admin shows it to the agent)
//   6. The code is now hidden from future queries (select: false)
const generateAgentSecurityCode = async (req, res) => {
  const { id } = req.params;

  // ── Find the user and confirm they are an agent ────────────────────────────
  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role !== 'agent') {
    throw new AppError('This user is not an agent', 400);
  }

  // ── Generate a new security code using the static method in User.js ───────
  const securityCode = User.generateSecurityCode();

  // ── Save the code to the database ─────────────────────────────────────────
  user.agentSecurityCode = securityCode;
  await user.save();

  // Return the code to the admin
  // NOTE: This is the ONLY time the code is shown in plain text.
  // After this, it's hidden by select: false in the schema.
  res.status(200).json({
    success: true,
    message: `Security code generated for agent ${user.name}`,
    agentName: user.name,
    agentEmail: user.email,
    securityCode, // Important: show it only this one time
  });
};


// ─── 7. deleteUser ───────────────────────────────────────────────────────────
// Handles: DELETE /api/admin/users/:id
// Who can use it: admin only
//
// WHY this function exists:
//   Admins may need to remove a user who violates policies,
//   is a duplicate account, or has left the organization.
//   This function handles the full cleanup.
//
// WHY we delete the user's complaints first?
//   If we delete the user without their complaints, those complaints
//   will remain in the database with a user field pointing to a user
//   that no longer exists — a "dangling reference".
//   This is like removing a person from a company but leaving their
//   files with their name on them — the files become orphaned.
//   To keep the database clean, we delete the user's complaints first,
//   then delete the user.
//
// HOW it works step by step:
//   1. Read the user ID from the URL (:id)
//   2. Prevent admin from deleting themselves
//   3. Find the user
//   4. Delete all complaints filed by this user
//   5. Delete the user document itself
const deleteUser = async (req, res) => {
  const { id } = req.params;

  // ── Safety check: admin cannot delete themselves ──────────────────────────
  // WHY? If an admin deletes their own account, they lose access and
  // there may be no other admin to restore it. This prevents that.
  if (id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  // ── Find the user we want to delete ───────────────────────────────────────
  const user = await User.findById(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // ── Step 1: Delete all complaints filed by this user ─────────────────────
  // deleteMany() removes ALL documents matching the filter in one query.
  // { user: id } → find every complaint where the user field equals this user's ID
  // This is more efficient than finding each complaint and deleting one by one.
  const deletedComplaints = await Complaint.deleteMany({ user: id });
  // deletedComplaints.deletedCount = how many complaints were removed

  // ── Step 2: Delete the user document ─────────────────────────────────────
  // user.deleteOne() removes this specific document from MongoDB.
  // We already have the document in memory from findById() above,
  // so deleteOne() on the document avoids an extra database roundtrip.
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: `User '${user.name}' and their ${deletedComplaints.deletedCount} complaint(s) have been deleted`,
  });
};


// ─── EXPORT ALL 7 FUNCTIONS ───────────────────────────────────────────────────
// Export every function so adminRoutes.js can import and use them
module.exports = {
  getDashboard,
  getAllUsers,
  getAllAgents,
  updateUserRole,
  assignComplaint,
  generateAgentSecurityCode,
  deleteUser,
};
