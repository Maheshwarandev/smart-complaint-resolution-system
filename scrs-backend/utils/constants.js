const ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin',
};

const COMPLAINT_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const COMPLAINT_CATEGORY = {
  TECHNICAL: 'technical',
  INFRASTRUCTURE: 'infrastructure',
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
  OTHER: 'other',
};

const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const DEFAULTS = {
  DEFAULT_PRIORITY: COMPLAINT_PRIORITY.MEDIUM,
  DEFAULT_ROLE: ROLES.USER,
  DEFAULT_STATUS: COMPLAINT_STATUS.OPEN,
};

const SLA_HOURS_BY_PRIORITY = {
  [COMPLAINT_PRIORITY.CRITICAL]: 4,   // 4 hours for Critical
  [COMPLAINT_PRIORITY.HIGH]: 24,      // 24 hours for High
  [COMPLAINT_PRIORITY.MEDIUM]: 48,    // 48 hours for Medium
  [COMPLAINT_PRIORITY.LOW]: 72,       // 72 hours for Low
};

module.exports = {
  ROLES,
  COMPLAINT_STATUS,
  COMPLAINT_CATEGORY,
  COMPLAINT_PRIORITY,
  SLA_HOURS_BY_PRIORITY,
  DEFAULTS,
};
