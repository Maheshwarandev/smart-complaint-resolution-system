// ─────────────────────────────────────────────────────────────────────────────
// controllers/complaintController.js — COMPLAINT BUSINESS LOGIC
//
// This file contains all the logic for handling complaint-related requests.
// Each function below corresponds to one route (URL + HTTP method).
//
// The 6 functions:
//   createComplaint    → POST   /api/complaints
//   getAllComplaints    → GET    /api/complaints
//   getComplaintById   → GET    /api/complaints/:id
//   updateComplaint    → PUT    /api/complaints/:id
//   deleteComplaint    → DELETE /api/complaints/:id
//   getComplaintStats  → GET    /api/complaints/stats
// ─────────────────────────────────────────────────────────────────────────────

// Import the Complaint model — lets us query and save to the 'complaints' collection
const Complaint = require('../models/Complaint');
const cloudinary = require('../config/cloudinary');

// AppError is our custom error class with a status code
const { AppError } = require('../utils/errorHandler');

// Import validators for complaint fields
const {
  validateComplaintTitle,
  validateComplaintDescription,
  validateCategory,
  validateStatus,
  validatePriority,
} = require('../utils/validators');

// Import system constants
const { ROLES, COMPLAINT_STATUS } = require('../utils/constants');


// ─── 1. createComplaint ───────────────────────────────────────────────────────
// Handles: POST /api/complaints
// Who can use it: ONLY regular users (role === 'user')
//
// Agents and admins are NOT allowed to file complaints.
// Agents resolve complaints; admins manage the system.
// Creating a complaint is a user-only action.
const createComplaint = async (req, res) => {
  // ── Role guard: only 'user' role can submit complaints ───────────────────
  if (req.user.role !== ROLES.USER) {
    throw new AppError('Only regular users can submit complaints', 403);
  }

  // Read the complaint details from the request body (what the client sent)
  let { title, description, category, priority } = req.body;

  // Validate all required fields
  title = validateComplaintTitle(title);
  description = validateComplaintDescription(description);
  category = validateCategory(category);

  // Priority is optional — validate if provided
  if (priority) {
    priority = validatePriority(priority);
  }

  // Helper promise to upload a buffer stream to Cloudinary
  const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'scrs_attachments' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });
  };

  // Process attachments if any
  const attachments = [];
  if (req.files && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer);
        return {
          filename: file.originalname,
          filepath: result.secure_url // Save the full secure URL of the file
        };
      });
      const uploadedAttachments = await Promise.all(uploadPromises);
      attachments.push(...uploadedAttachments);
    } catch (uploadError) {
      throw new AppError(`File upload to Cloudinary failed: ${uploadError.message}`, 500);
    }
  }

  // Create the complaint in MongoDB.
  // SECURITY NOTE: We set user: req.user._id — NOT from the request body.
  // If we trusted the client to send their own user ID, they could pretend
  // to be someone else. Instead, we take the ID from the token (via protect middleware).
  // req.user was set by the protect middleware in authMiddleware.js.
  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority,       // optional — defaults to 'Medium' if not sent
    user: req.user._id, // always from the verified token, never from req.body
    attachments,
    history: [{
      action: 'Complaint Created',
      performedBy: req.user.name,
      role: req.user.role
    }]
  });

  // 201 = Created — the standard status code for successfully creating a resource
  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    complaint,
  });
};



// ─── 2. getAllComplaints ──────────────────────────────────────────────────────
// Handles: GET /api/complaints
// Who can use it: any logged-in user — but results depend on role
//
// Regular users → see ONLY their own complaints
// Agents/Admins → see ALL complaints from everyone
const getAllComplaints = async (req, res) => {
  // Start with an empty filter object — empty means "find everything"
  let filter = {};

  // ─── ROLE-BASED FILTERING ──────────────────────────────────────────────────
  // Different roles see different results from the same endpoint.
  // This is safer than creating separate endpoints for each role.

  if (req.user.role === ROLES.USER) {
    // Users can ONLY see their own complaints
    filter = { user: req.user._id };
    // filter = { user: "64f1a..." } → Complaint.find will only return
    // documents where complaint.user === this user's ID
    
  } else if (req.user.role === ROLES.AGENT || req.user.role === ROLES.ADMIN) {
    // Agents and admins see ALL complaints (no filter)
    // They need full visibility to manage and resolve complaints
    filter = {};  // empty filter = no restrictions
    
  } else {
    // Unknown role — reject explicitly to prevent bypasses
    throw new AppError(`Cannot fetch complaints with unknown role: ${req.user.role}`, 403);
  }

  const complaints = await Complaint.find(filter)
    .populate('user', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .populate('comments.user', 'name email avatar role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length, // total number returned
    complaints,
  });
};


// ─── 3. getComplaintById ─────────────────────────────────────────────────────
// Handles: GET /api/complaints/:id
// Who can use it: any logged-in user (but users can only see their own)
//
// Returns a single complaint by its MongoDB _id
const getComplaintById = async (req, res) => {
  // req.params.id captures the :id part from the URL
  // Example: GET /api/complaints/64f3c1a2b5e8 → req.params.id = "64f3c1a2b5e8"
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .populate('comments.user', 'name email avatar role');

  // If no complaint was found with that ID, return a 404 error
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // ─── ROLE-BASED ACCESS CONTROL ─────────────────────────────────────────────
  // Different roles have different visibility rules for the same complaint.

  if (req.user.role === ROLES.USER) {
    // Users can ONLY view complaints that belong to them
    if (complaint.user._id.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to view this complaint', 403);
    }
    
  } else if (req.user.role === ROLES.AGENT || req.user.role === ROLES.ADMIN) {
    // Agents and admins can view ANY complaint
    // No additional checks needed
    
  } else {
    // Unknown role — reject explicitly
    throw new AppError(`Cannot view complaint with unknown role: ${req.user.role}`, 403);
  }

  res.status(200).json({
    success: true,
    complaint,
  });
};


// ─── 4. updateComplaint ──────────────────────────────────────────────────────
// Handles: PUT /api/complaints/:id
// Who can use it: any logged-in user — but each role can only edit certain fields
//
// Role-based update rules:
//   User  → can change: title, description, category — ONLY if status is 'Open'
//   Agent → can change: status, priority, assignedTo, resolutionNote
//   Admin → can change: status, priority, assignedTo, resolutionNote
const updateComplaint = async (req, res) => {
  // Find the complaint by its ID first
  const complaint = await Complaint.findById(req.params.id);

  // If not found, return 404
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // Destructure role and _id from the logged-in user for easier use below
  const { role, _id: userId } = req.user;
  // { _id: userId } is shorthand — it reads req.user._id and names it 'userId'

  // ─── EXPLICIT ROLE-BASED PERMISSION CHECKS ──────────────────────────────────
  // We check each role explicitly to prevent unknown roles from bypassing logic.

  if (role === ROLES.USER) {
    // ── Users: restricted access ─────────────────────────────────────────────

    // Users can only edit complaints that belong to them
    if (complaint.user.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to update this complaint', 403);
    }

    // Users cannot edit a complaint that is already being worked on.
    // If status is 'In Progress', 'Resolved', or 'Closed', block the edit.
    // Why? An agent might already be investigating — changing the description
    // mid-investigation would be confusing and disruptive.
    if (complaint.status !== COMPLAINT_STATUS.OPEN) {
      throw new AppError('You cannot edit a complaint that is no longer Open', 400);
    }

    // Users may only change: title, description, category
    // We check each field — only update it if the client actually sent a new value
    let { title, description, category } = req.body;
    if (title) {
      title = validateComplaintTitle(title);
      complaint.title = title;
    }
    if (description) {
      description = validateComplaintDescription(description);
      complaint.description = description;
    }
    if (category) {
      category = validateCategory(category);
      complaint.category = category;
    }

  } else if (role === ROLES.AGENT || role === ROLES.ADMIN) {
    // ── Agents and Admins: operational fields ────────────────────────────────
    // Both agents and admins can manage complaint status and assignment

    // Agents and admins manage the complaint status and assignment
    let { status, priority, assignedTo, resolutionNote } = req.body;
    if (status) {
      status = validateStatus(status);
      if (complaint.status !== status) {
        complaint.history.push({
          action: 'Status Changed',
          prevValue: complaint.status,
          newValue: status,
          performedBy: req.user.name,
          role: req.user.role
        });
        complaint.status = status;
      }
    }
    if (priority) {
      priority = validatePriority(priority);
      if (complaint.priority !== priority) {
        complaint.history.push({
          action: 'Priority Changed',
          prevValue: complaint.priority,
          newValue: priority,
          performedBy: req.user.name,
          role: req.user.role
        });
        complaint.priority = priority;
      }
    }
    if (assignedTo !== undefined && complaint.assignedTo?.toString() !== assignedTo?.toString()) {
      complaint.history.push({
        action: 'Assigned to Agent',
        newValue: assignedTo ? 'Agent ID: ' + assignedTo : 'Unassigned',
        performedBy: req.user.name,
        role: req.user.role
      });
      complaint.assignedTo = assignedTo;
    }
    if (resolutionNote !== undefined) {
      // Validate resolution note if provided
      if (resolutionNote && typeof resolutionNote === 'string') {
        resolutionNote = resolutionNote.trim();
        if (resolutionNote.length > 1000) {
          throw new AppError('Resolution note is too long (max 1000 characters)', 400);
        }
      }
      if (complaint.resolutionNote !== resolutionNote) {
        complaint.history.push({
          action: 'Resolution Note Added',
          newValue: resolutionNote,
          performedBy: req.user.name,
          role: req.user.role
        });
        complaint.resolutionNote = resolutionNote;
      }
    }

  } else {
    // ── Unknown role: reject ─────────────────────────────────────────────────
    // If somehow an unknown role reaches this point, we explicitly reject it.
    // This prevents logic bypasses from unexpected role values.
    throw new AppError(`Cannot update complaint with unknown role: ${role}`, 403);
  }

  // WHY complaint.save() instead of findByIdAndUpdate()?
  //   complaint.save() runs Mongoose validators and pre-save hooks.
  //   findByIdAndUpdate() skips both — if we had validation rules, they'd be bypassed.
  //   Always prefer .save() when you care about hooks and validators.
  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Complaint updated successfully',
    complaint,
  });
};


// ─── 5. deleteComplaint ──────────────────────────────────────────────────────
// Handles: DELETE /api/complaints/:id
//
// Deletion rules by role:
//   User  → can delete ONLY their own complaints, ONLY if status is 'Open'
//   Agent → CANNOT delete (agents resolve complaints, not delete them)
//   Admin → can delete any complaint
const deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  const { role, _id: userId } = req.user;

  if (role === ROLES.USER) {
    // ── Users: can only delete their own Open complaints ──────────────────────
    
    // Check ownership
    if (complaint.user.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to delete this complaint', 403);
    }
    // Users can only delete Open complaints
    if (complaint.status !== COMPLAINT_STATUS.OPEN) {
      throw new AppError('You can only delete an Open complaint', 400);
    }
    
  } else if (role === ROLES.AGENT) {
    // ── Agents: NOT allowed to delete ────────────────────────────────────────
    // Agents resolve complaints but don't delete them.
    // Deletion is an admin-only action.
    throw new AppError('Agents are not authorized to delete complaints', 403);
    
  } else if (role === ROLES.ADMIN) {
    // ── Admins: can delete any complaint ─────────────────────────────────────
    // No restrictions — admins have full power.
    // (We allow deletion to proceed without additional checks)
    
  } else {
    // ── Unknown role: reject ─────────────────────────────────────────────────
    // If somehow an unknown role reaches this point, we explicitly reject it.
    throw new AppError(`Cannot delete complaint with unknown role: ${role}`, 403);
  }

  // complaint.deleteOne() removes this specific document from MongoDB.
  // We already have the document in memory from Complaint.findById() above,
  // so using deleteOne() on the document avoids hitting the database again.
  // This is slightly more efficient than Complaint.findByIdAndDelete().
  await complaint.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Complaint deleted successfully',
  });
};


// ─── 6. getComplaintStats ─────────────────────────────────────────────────────
// Handles: GET /api/complaints/stats
// Who can use it: admin and agent only (enforced in the route file)
//
// Returns the total count of complaints grouped by status.
// Example: { Open: 12, "In Progress": 5, Resolved: 23, Closed: 8 }
const getComplaintStats = async (req, res) => {
  // MongoDB Aggregation Pipeline
  // An aggregation pipeline processes documents through a series of stages.
  // Think of it like an assembly line — each stage transforms the data.
  //
  // Here we use one stage: $group
  // $group works like GROUP BY in SQL.
  //
  // $group explanation:
  //   _id: '$status' → group documents by the value of their 'status' field
  //   count: { $sum: 1 } → for each group, count 1 for every document
  //
  // Result example:
  //   [ { _id: 'Open', count: 12 }, { _id: 'Resolved', count: 5 }, ... ]
  const stats = await Complaint.aggregate([
    {
      $group: {
        _id: '$status',    // group by the 'status' field
        count: { $sum: 1 }, // count each document in the group
      },
    },
  ]);

  res.status(200).json({
    success: true,
    stats,
  });
};


// ─── 7. addComment ─────────────────────────────────────────────────────────────
// Handles: POST /api/complaints/:id/comments
// Allows user, assigned agent, or admin to post a comment/message on the complaint thread.
const addComment = async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    throw new AppError('Comment text is required', 400);
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // Access check: User, assigned Agent, or Admin
  const isOwner = complaint.user.toString() === req.user._id.toString();
  const isAssigned = complaint.assignedTo && complaint.assignedTo.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isAssigned && !isAdmin) {
    throw new AppError('Not authorized to comment on this complaint', 403);
  }

  complaint.comments.push({
    user: req.user._id,
    text: text.trim()
  });

  await complaint.save();
  await complaint.populate('comments.user', 'name email avatar role');

  res.status(200).json({
    success: true,
    data: complaint
  });
};


// ─── 8. rateComplaint ──────────────────────────────────────────────────────────
// Handles: POST /api/complaints/:id/rate
// Allows complaint owner to rate a resolved or closed complaint (1 to 5 stars + feedback).
const rateComplaint = async (req, res) => {
  const { score, feedback } = req.body;
  const numericScore = Number(score);

  if (!numericScore || numericScore < 1 || numericScore > 5) {
    throw new AppError('Rating score must be a number between 1 and 5', 400);
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // Owner guard
  if (complaint.user.toString() !== req.user._id.toString()) {
    throw new AppError('Only the complaint author can submit feedback', 403);
  }

  if (complaint.status !== COMPLAINT_STATUS.RESOLVED && complaint.status !== COMPLAINT_STATUS.CLOSED) {
    throw new AppError('You can only rate complaints that are Resolved or Closed', 400);
  }

  complaint.rating = {
    score: numericScore,
    feedback: feedback ? feedback.trim() : '',
    ratedAt: new Date()
  };

  await complaint.save();

  res.status(200).json({
    success: true,
    data: complaint
  });
};


// Export all functions so the route file can import them
module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  addComment,
  rateComplaint,
};
