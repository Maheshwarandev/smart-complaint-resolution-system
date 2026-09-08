import React from "react";

const ActivityTimeline = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>
        <i className="ti ti-history" style={{ color: "var(--brand)", fontSize: "16px" }} />
        <span>Activity Audit Timeline</span>
      </div>

      <div style={styles.timeline}>
        {history.map((h, i) => (
          <div key={i} style={styles.timelineItem}>
            <div style={styles.timelineDot} />
            <div style={styles.timelineContent}>
              <div style={styles.timelineHeader}>
                <span style={styles.timelineAction}>{h.action}</span>
                <span style={styles.timelineTime}>
                  {new Date(h.timestamp).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {h.prevValue && h.newValue && (
                <div style={styles.timelineChanges}>
                  <span>{h.prevValue}</span>
                  <i className="ti ti-arrow-right" style={{ fontSize: "11px", color: "var(--text-muted)" }} />
                  <strong>{h.newValue}</strong>
                </div>
              )}

              {!h.prevValue && h.newValue && (
                <div style={styles.timelineChanges}>
                  <strong>{h.newValue}</strong>
                </div>
              )}

              <div style={styles.timelineUser}>
                By {h.performedBy} ({h.role})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid var(--border)",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "12px",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderLeft: "2px solid var(--border)",
    paddingLeft: "16px",
    marginLeft: "8px",
  },
  timelineItem: {
    position: "relative",
  },
  timelineDot: {
    position: "absolute",
    left: "-22px",
    top: "4px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "var(--brand)",
    border: "2px solid var(--bg-surface)",
  },
  timelineContent: {
    background: "var(--bg-hover)",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  timelineAction: {
    color: "var(--text-primary)",
    fontSize: "12px",
    fontWeight: "600",
  },
  timelineTime: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
  },
  timelineChanges: {
    fontSize: "12px",
    color: "var(--text-primary)",
    background: "var(--bg-base)",
    padding: "4px 8px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    marginBottom: "4px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  timelineUser: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
};

export default ActivityTimeline;
