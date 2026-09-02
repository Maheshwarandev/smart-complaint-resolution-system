import { STATUS_META, PRIORITY_DOT } from "../../utils/statusMeta";
import { User, Tag, Zap, Calendar } from "lucide-react";

/**
 * Reusable complaint card for dashboard lists.
 * @param {object} props
 * @param {object} props.complaint - Complaint data object
 */
const ComplaintCard = ({ complaint: c }) => {
  const sm = STATUS_META[c.status] || {};
  const pd = PRIORITY_DOT[c.priority] || "#94a3b8";

  return (
    <div style={s.card} className="glass-panel hover-lift">
      <div style={s.top}>
        <div style={s.titleRow}>
          <span style={{ ...s.priorityDot, background: pd }} title={c.priority} />
          <span style={s.titleText}>{c.title}</span>
        </div>
        <span style={{ ...s.statusPill, background: sm.bg, color: sm.color }}>
          {c.status}
        </span>
      </div>
      <p style={s.desc}>
        {c.description?.slice(0, 90) ?? ""}
        {(c.description?.length ?? 0) > 90 ? "…" : ""}
      </p>
      <div style={s.meta}>
        {c.user?.name && <span style={{display:"flex",alignItems:"center",gap:"0.25rem"}}><User size={12} /> {c.user.name}</span>}
        <span style={{display:"flex",alignItems:"center",gap:"0.25rem"}}><Tag size={12} /> {c.category}</span>
        <span style={{display:"flex",alignItems:"center",gap:"0.25rem"}}><Zap size={12} /> {c.priority}</span>
        <span style={{display:"flex",alignItems:"center",gap:"0.25rem"}}><Calendar size={12} /> {new Date(c.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const s = {
  card: { padding: "1.2rem", background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border-subtle)" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem" },
  titleRow: { display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 },
  priorityDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  titleText: { fontWeight: "600", color: "var(--text-primary)", fontSize: "0.98rem" },
  statusPill: { padding: "0.2rem 0.65rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700", whiteSpace: "nowrap", marginLeft: "0.5rem" },
  desc: { margin: "0 0 0.75rem", color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.45" },
  meta: { display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", flexWrap: "wrap" },
};

export default ComplaintCard;
