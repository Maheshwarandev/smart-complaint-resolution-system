import React from "react";

const ActivityTimeline = ({ history }) => {
  if (!history || history.length === 0) return null;

  const s = styles;
  return (
    <div style={s.section}>
      <h4 style={s.sectionTitle}>⏳ Activity Timeline</h4>
      <div style={s.timeline}>
        {history.map((h, i) => (
          <div key={i} style={s.timelineItem}>
            <div style={s.timelineDot}></div>
            <div style={s.timelineContent}>
              <div style={s.timelineTime}>
                {new Date(h.timestamp).toLocaleString()}
              </div>
              <strong style={s.timelineAction}>{h.action}</strong>
              
              {h.prevValue && h.newValue && (
                <div style={s.timelineChanges}>
                  {h.prevValue} → {h.newValue}
                </div>
              )}
              {!h.prevValue && h.newValue && (
                <div style={s.timelineChanges}>{h.newValue}</div>
              )}
              
              <div style={s.timelineUser}>
                By: {h.performedBy} ({h.role})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: { marginTop: "1.5rem", marginBottom: "1.5rem" },
  sectionTitle: { margin: "0 0 1rem", color: "var(--text-primary)", fontSize: "1rem", fontWeight: "700" },
  timeline: { display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "2px solid var(--border-subtle)", paddingLeft: "1.2rem", marginLeft: "0.5rem", marginTop: "0.5rem" },
  timelineItem: { position: "relative" },
  timelineDot: { position: "absolute", left: "-1.55rem", top: "0.3rem", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-blue)", border: "2px solid var(--bg-app)" },
  timelineContent: { background: "rgba(255,255,255,0.01)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" },
  timelineTime: { fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.2rem" },
  timelineAction: { display: "block", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "0.25rem" },
  timelineChanges: { fontSize: "0.85rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.015)", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border-subtle)", marginBottom: "0.4rem" },
  timelineUser: { fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }
};

export default ActivityTimeline;
