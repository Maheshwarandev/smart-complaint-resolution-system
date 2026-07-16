// ─────────────────────────────────────────────────────────────────────────────
// utils/constants.js — SYSTEM-WIDE CONSTANTS
//
// Centralized definitions for:
//   - User roles (who can do what)
//   - Complaint statuses (lifecycle states)
//   - Complaint categories (types of issues)
//   - Complaint priorities (urgency levels)
//
// By using constants, we avoid magic strings and make changes easy.
// If we need to rename a role, we change it in ONE place, not everywhere.
// ─────────────────────────────────────────────────────────────────────────────

// ─── USER ROLES ────────────────────────────────────────────────────────────────
// Three distinct roles with different permissions
const ROLES = {
  USER: 'user',      // Can submit complaints, view their own
  AGENT: 'agent',    // Can view and update all complaints, assign to self
  ADMIN: 'admin',    // Can manage users, agents, and all complaints
};

// ─── COMPLAINT STATUSES ────────────────────────────────────────────────────────
// Lifecycle states a complaint moves through
const COMPLAINT_STATUS = {
  OPEN: 'Open',           // Just submitted, waiting for agent
  IN_PROGRESS: 'In Progress',  // Agent is investigating
  RESOLVED: 'Resolved',   // Problem fixed, pending closure
  CLOSED: 'Closed',       // Complaint concluded
};

// ─── COMPLAINT CATEGORIES ──────────────────────────────────────────────────────
// Types of complaints the system accepts
const COMPLAINT_CATEGORY = {
  TECHNICAL: 'technical',        // General technical issues
  INFRASTRUCTURE: 'infrastructure', // Building, internet, power, water
  ELECTRICAL: 'electrical',
  NETWORK: 'network',
  SOFTWARE: 'software',
  HARDWARE: 'hardware',
  MAINTENANCE: 'maintenance',
  SECURITY: 'security',
  HOUSEKEEPING: 'housekeeping',
  FINANCE: 'finance',
  HR: 'hr',
  GENERAL: 'general',
  OTHER: 'other',              // Miscellaneous
};

// ─── COMPLAINT PRIORITIES ──────────────────────────────────────────────────────
// How urgent a complaint is (affects resolution timeline)
const COMPLAINT_PRIORITY = {
  LOW: 'low',           // Can wait
  MEDIUM: 'medium',     // Normal timeline
  HIGH: 'high',         // Urgent
  CRITICAL: 'critical', // Emergency
};

// ─── DEFAULT VALUES ───────────────────────────────────────────────────────────
// Sensible defaults when fields are optional
const DEFAULTS = {
  DEFAULT_PRIORITY: COMPLAINT_PRIORITY.MEDIUM,
  DEFAULT_ROLE: ROLES.USER,
  DEFAULT_STATUS: COMPLAINT_STATUS.OPEN,
};

// Export as object for easy access
module.exports = {
  ROLES,
  COMPLAINT_STATUS,
  COMPLAINT_CATEGORY,
  COMPLAINT_PRIORITY,
  DEFAULTS,
};
