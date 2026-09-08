const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/errorHandler');
const {
  validateComplaintTitle,
  validateComplaintDescription,
  validateCategory,
  validateStatus,
  validatePriority,
} = require('../utils/validators');
const { ROLES, COMPLAINT_STATUS, SLA_HOURS_BY_PRIORITY } = require('../utils/constants');
const { uploadToCloudinary } = require('../utils/cloudinary');
const {
  sendTicketCreatedEmail,
  sendTicketAssignedEmail,
  sendTicketStatusUpdatedEmail,
  sendNewCommentEmail,
} = require('../utils/emailService');
const { autoAssignComplaint } = require('../utils/autoAssign');

/** POST /api/complaints — create a new complaint (user only) */
const createComplaint = async (req, res) => {
  if (req.user.role !== ROLES.USER) {
    throw new AppError('Only regular users can submit complaints', 403);
  }

  let { title, description, category, priority } = req.body;

  title = validateComplaintTitle(title);
  description = validateComplaintDescription(description);
  category = validateCategory(category);
  if (priority) {
    priority = validatePriority(priority);
  } else {
    priority = 'medium';
  }

  // Calculate SLA Deadline
  const slaHours = SLA_HOURS_BY_PRIORITY[priority] || 48;
  const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

  // Upload attachments to Cloudinary
  const attachments = [];
  if (req.files && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, 'scrs_attachments');
        return { filename: file.originalname, filepath: result.secure_url };
      });
      attachments.push(...(await Promise.all(uploadPromises)));
    } catch (uploadError) {
      throw new AppError(`File upload failed: ${uploadError.message}`, 500);
    }
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority,
    user: req.user._id, // from token, never from client
    attachments,
    slaDeadline,
    slaBreached: false,
    history: [{
      action: 'Complaint Created',
      performedBy: req.user.name,
      role: req.user.role,
    }],
  });

  // 1. Send confirmation in-app notification to the user
  await Notification.create({
    user: req.user._id,
    title: '🛡️ Service Ticket Created',
    message: `Ticket #${complaint._id.toString().slice(-6)} ("${complaint.title}") was submitted successfully with a ${slaHours}h SLA target.`,
    link: '/complaints',
    type: 'info',
  });

  // 2. Trigger confirmation email to the user (non-blocking)
  sendTicketCreatedEmail(req.user, complaint).catch((err) =>
    console.warn('Email trigger error:', err.message)
  );

  // 3. Smart Auto-Assignment to least-busy agent
  await autoAssignComplaint(complaint, req.user);

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    complaint,
  });
};

/** GET /api/complaints — list complaints (filtered by role) */
const getAllComplaints = async (req, res) => {
  let filter = {};

  if (req.user.role === ROLES.USER) {
    filter = { user: req.user._id };
  } else if (req.user.role === ROLES.AGENT) {
    filter = {}; // Agents can view all or assigned
  } else if (req.user.role === ROLES.ADMIN) {
    filter = {};
  } else {
    throw new AppError(`Cannot fetch complaints with unknown role: ${req.user.role}`, 403);
  }

  const complaints = await Complaint.find(filter)
    .populate('user', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .populate('comments.user', 'name email avatar role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: complaints.length,
    complaints,
  });
};

/** GET /api/complaints/:id — get a specific complaint */
const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .populate('comments.user', 'name email avatar role');

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // Users can only view their own complaints
  if (req.user.role === ROLES.USER) {
    if (complaint.user._id.toString() !== req.user._id.toString()) {
      throw new AppError('You are not authorized to view this complaint', 403);
    }
  } else if (req.user.role !== ROLES.AGENT && req.user.role !== ROLES.ADMIN) {
    throw new AppError(`Cannot view complaint with unknown role: ${req.user.role}`, 403);
  }

  res.status(200).json({ success: true, complaint });
};

/** PUT /api/complaints/:id — update complaint (role-restricted fields) */
const updateComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email');

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  const { role, _id: userId } = req.user;

  if (role === ROLES.USER) {
    if (complaint.user._id.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to update this complaint', 403);
    }
    if (complaint.status !== COMPLAINT_STATUS.OPEN) {
      throw new AppError('You cannot edit a complaint that is no longer Open', 400);
    }

    let { title, description, category } = req.body;
    if (title) complaint.title = validateComplaintTitle(title);
    if (description) complaint.description = validateComplaintDescription(description);
    if (category) complaint.category = validateCategory(category);

  } else if (role === ROLES.AGENT || role === ROLES.ADMIN) {
    let { status, priority, assignedTo, resolutionNote } = req.body;

    if (status) {
      status = validateStatus(status);
      if (complaint.status !== status) {
        complaint.history.push({
          action: 'Status Changed',
          prevValue: complaint.status,
          newValue: status,
          performedBy: req.user.name,
          role: req.user.role,
        });
        complaint.status = status;

        // If resolving, record resolution timestamp and check SLA
        if (status === COMPLAINT_STATUS.RESOLVED || status === COMPLAINT_STATUS.CLOSED) {
          complaint.resolvedAt = new Date();
          if (complaint.slaDeadline && complaint.resolvedAt > complaint.slaDeadline) {
            complaint.slaBreached = true;
          }
        }

        // Send in-app notification to ticket owner
        await Notification.create({
          user: complaint.user._id,
          title: `📌 Status: ${status}`,
          message: `Ticket #${complaint._id.toString().slice(-6)} is now marked as "${status}".`,
          link: '/complaints',
          type: 'status',
        });

        // Trigger email to user
        sendTicketStatusUpdatedEmail(complaint.user, complaint).catch((err) =>
          console.warn('Status update email warning:', err.message)
        );
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
          role: req.user.role,
        });
        complaint.priority = priority;

        // Recalculate SLA
        const slaHours = SLA_HOURS_BY_PRIORITY[priority] || 48;
        complaint.slaDeadline = new Date(new Date(complaint.createdAt).getTime() + slaHours * 60 * 60 * 1000);
      }
    }

    if (assignedTo !== undefined && complaint.assignedTo?._id?.toString() !== assignedTo?.toString()) {
      let agentUser = null;
      if (assignedTo) {
        agentUser = await User.findById(assignedTo).select('_id name email role');
      }

      complaint.history.push({
        action: 'Assigned to Agent',
        newValue: agentUser ? agentUser.name : 'Unassigned',
        performedBy: req.user.name,
        role: req.user.role,
      });
      complaint.assignedTo = assignedTo || null;

      if (agentUser) {
        // In-app notification & Email to newly assigned agent
        await Notification.create({
          user: agentUser._id,
          title: '🛠️ Ticket Assigned',
          message: `You were assigned Ticket #${complaint._id.toString().slice(-6)}: "${complaint.title}".`,
          link: '/agent/complaints',
          type: 'assignment',
        });

        sendTicketAssignedEmail(agentUser, complaint, complaint.user).catch((err) =>
          console.warn('Assigned email warning:', err.message)
        );
      }
    }

    if (resolutionNote !== undefined) {
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
          role: req.user.role,
        });
        complaint.resolutionNote = resolutionNote;
      }
    }
  } else {
    throw new AppError(`Cannot update complaint with unknown role: ${role}`, 403);
  }

  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Complaint updated successfully',
    complaint,
  });
};

/** DELETE /api/complaints/:id — delete a complaint */
const deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  const { role, _id: userId } = req.user;

  if (role === ROLES.USER) {
    if (complaint.user.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to delete this complaint', 403);
    }
    if (complaint.status !== COMPLAINT_STATUS.OPEN) {
      throw new AppError('You can only delete an Open complaint', 400);
    }
  } else if (role === ROLES.AGENT) {
    throw new AppError('Agents are not authorized to delete complaints', 403);
  } else if (role !== ROLES.ADMIN) {
    throw new AppError(`Cannot delete complaint with unknown role: ${role}`, 403);
  }

  await complaint.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Complaint deleted successfully',
  });
};

/** GET /api/complaints/stats — complaint counts grouped by status (agent/admin) */
const getComplaintStats = async (req, res) => {
  const stats = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.status(200).json({ success: true, stats });
};

/** POST /api/complaints/:id/comments — add a comment */
const addComment = async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    throw new AppError('Comment text is required', 400);
  }

  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  const isOwner = complaint.user._id.toString() === req.user._id.toString();
  const isAssigned = complaint.assignedTo && complaint.assignedTo._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isAssigned && !isAdmin) {
    throw new AppError('Not authorized to comment on this ticket', 403);
  }

  complaint.comments.push({ user: req.user._id, text: text.trim() });
  await complaint.save();
  await complaint.populate('comments.user', 'name email avatar role');

  // Notify the other party
  const recipient = isOwner ? complaint.assignedTo : complaint.user;
  if (recipient && recipient._id.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: recipient._id,
      title: '💬 New Message on Ticket',
      message: `${req.user.name} posted a message on #${complaint._id.toString().slice(-6)}: "${text.trim().substring(0, 50)}..."`,
      link: isOwner ? '/agent/complaints' : '/complaints',
      type: 'comment',
    });

    sendNewCommentEmail(recipient, req.user, complaint, text.trim()).catch((err) =>
      console.warn('Comment email warning:', err.message)
    );
  }

  res.status(200).json({ success: true, data: complaint });
};

/** POST /api/complaints/:id/rate */
const rateComplaint = async (req, res) => {
  const { score, feedback } = req.body;
  const numericScore = Number(score);
  if (!numericScore || numericScore < 1 || numericScore > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const complaint = await Complaint.findById(req.params.id).populate('assignedTo', 'name email');
  if (!complaint) throw new AppError('Complaint not found', 404);
  if (complaint.user.toString() !== req.user._id.toString()) throw new AppError('Only author can rate', 403);
  if (complaint.status !== COMPLAINT_STATUS.RESOLVED && complaint.status !== COMPLAINT_STATUS.CLOSED) {
    throw new AppError('Can only rate Resolved or Closed complaints', 400);
  }

  complaint.rating = {
    score: numericScore,
    feedback: feedback ? feedback.trim() : '',
    ratedAt: new Date(),
  };
  await complaint.save();

  // If assigned agent exists, notify them of the rating
  if (complaint.assignedTo) {
    await Notification.create({
      user: complaint.assignedTo._id,
      title: '⭐ New Customer Feedback',
      message: `User rated Ticket #${complaint._id.toString().slice(-6)} ${numericScore}/5 Stars!`,
      link: '/agent/complaints',
      type: 'rating',
    });
  }

  res.status(200).json({ success: true, data: complaint });
};

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