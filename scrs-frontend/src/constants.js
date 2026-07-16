// ─────────────────────────────────────────────────────────────────────────────
// src/constants.js — FRONTEND SYSTEM CONSTANTS
//
// Centralized definitions for roles and complaint statuses used in the UI.
// This matches the backend constants for consistency.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin',
};

export const COMPLAINT_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const COMPLAINT_CATEGORY = {
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

export const COMPLAINT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};
