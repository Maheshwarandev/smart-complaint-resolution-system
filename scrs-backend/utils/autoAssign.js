const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { sendTicketAssignedEmail } = require('./emailService');
const { COMPLAINT_STATUS } = require('./constants');

/**
 * Automatically assigns a newly created complaint to the least-busy available agent.
 * @param {Object} complaint - Mongoose Complaint document
 * @param {Object} author - Complainant User object
 * @returns {Promise<Object|null>} - Assigned Agent object or null if no agents available
 */
const autoAssignComplaint = async (complaint, author) => {
  try {
    // 1. Fetch all active agents
    const agents = await User.find({ role: 'agent' }).select('_id name email role');
    if (!agents || agents.length === 0) {
      return null;
    }

    // 2. Count active (Open / In Progress) tickets for each agent
    const agentWorkloads = await Promise.all(
      agents.map(async (agent) => {
        const activeCount = await Complaint.countDocuments({
          assignedTo: agent._id,
          status: { $in: [COMPLAINT_STATUS.OPEN, COMPLAINT_STATUS.IN_PROGRESS] },
        });
        return { agent, activeCount };
      })
    );

    // 3. Sort by lowest workload first
    agentWorkloads.sort((a, b) => a.activeCount - b.activeCount);
    const chosenAgent = agentWorkloads[0].agent;

    // 4. Update the complaint with the assigned agent
    complaint.assignedTo = chosenAgent._id;
    complaint.status = COMPLAINT_STATUS.IN_PROGRESS;

    complaint.history.push({
      action: 'Auto-Assigned Agent',
      prevValue: 'Unassigned',
      newValue: chosenAgent.name,
      performedBy: 'System Auto-Router (Load Balancer)',
      role: 'system',
      timestamp: new Date(),
    });

    await complaint.save();

    // 5. Send in-app notification to the assigned agent
    await Notification.create({
      user: chosenAgent._id,
      title: '⚡ New Ticket Auto-Assigned',
      message: `Ticket #${complaint._id.toString().slice(-6)}: "${complaint.title}" has been assigned to your queue.`,
      link: '/agent/complaints',
      type: 'assignment',
    });

    // 6. Send email notification to the agent asynchronously
    sendTicketAssignedEmail(chosenAgent, complaint, author).catch((err) =>
      console.warn('Auto-assignment email warning:', err.message)
    );

    return chosenAgent;
  } catch (error) {
    console.error('Error in autoAssignComplaint:', error);
    return null;
  }
};

module.exports = {
  autoAssignComplaint,
};
