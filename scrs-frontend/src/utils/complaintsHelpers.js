// ─────────────────────────────────────────────────────────────────────────────
// src/utils/complaintsHelpers.js — Shared complaint display helpers
//
// Extracted from MyComplaints, AgentDashboard, AgentComplaints to avoid
// copy-pasting the same two functions across multiple pages.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the CSS class for a complaint card based on priority.
 * Maps to classes defined in index.css: complaint-card-high/medium/low
 */
export const getPriorityClass = (priority) => {
  if (priority === "high" || priority === "critical") return "complaint-card-high";
  if (priority === "low") return "complaint-card-low";
  return "complaint-card-medium";
};

/**
 * Returns the CSS class for a status badge based on complaint status.
 * Maps to classes defined in index.css: badge-open/progress/resolved/closed
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Open":        return "badge-open";
    case "In Progress": return "badge-progress";
    case "Resolved":    return "badge-resolved";
    default:            return "badge-closed";
  }
};
