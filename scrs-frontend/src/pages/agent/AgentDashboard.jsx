import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllComplaintsAPI } from "../../api/complaintAPI";
import useAuth from "../../hooks/useAuth";
import Spinner from "../../components/common/Spinner";

const STATUS_META = {
  Open:          { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", bar: "#3b82f6" },
  "In Progress": { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", bar: "#f59e0b" },
  Resolved:      { bg: "rgba(34, 197, 94, 0.15)", color: "#34d399", bar: "#22c55e" },
  Closed:        { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", bar: "#94a3b8" },
};

const PRIORITY_DOT = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

const AgentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await getAllComplaintsAPI();
        const myId = user._id.toString();
        const assigned = res.data.complaints.filter(c => {
          if (!c.assignedTo) return false;
          const aid = typeof c.assignedTo === "string"
            ? c.assignedTo
            : c.assignedTo._id.toString();
          return aid === myId;
        });
        setComplaints(assigned);
      } catch {
        setError("Failed to load your assignments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const counts = {
    Open:          complaints.filter(c => c.status === "Open").length,
    "In Progress": complaints.filter(c => c.status === "In Progress").length,
    Resolved:      complaints.filter(c => c.status === "Resolved").length,
    Closed:        complaints.filter(c => c.status === "Closed").length,
  };
  const total = complaints.length;

  // Active = Open + In Progress
  const active = counts["Open"] + counts["In Progress"];
  const done   = counts["Resolved"] + counts["Closed"];

  if (loading) return <Spinner />;

  return (
    <div style={s.page} className="animate-fade-in">

      {/* ── HERO BANNER ────────────────────────────────────────────────────── */}
      <div style={s.hero}>
        <div style={s.heroLeft}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "A"}</div>
          <div>
            <p style={s.heroRole}>Agent Portal</p>
            <h1 style={s.heroName}>{user?.name}</h1>
            <p style={s.heroSub}>{user?.email}</p>
          </div>
        </div>
        <div style={s.heroRight}>
          <div style={s.heroBadge}>
            <span style={s.dot} />
            Active
          </div>
          <Link to="/agent/complaints" style={s.heroBtn} className="hover-lift">
            Open Workbench →
          </Link>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {/* ── STAT STRIP ─────────────────────────────────────────────────────── */}
      <div style={s.statStrip}>
        {[
          { label: "Total Assigned", value: total,             accent: "var(--accent-blue)" },
          { label: "Active",         value: active,            accent: "#fbbf24" },
          { label: "Resolved",       value: counts["Resolved"],accent: "#34d399" },
          { label: "Closed",         value: counts["Closed"],  accent: "#94a3b8" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={s.statBox} className="glass-panel hover-lift">
            <p style={{ ...s.statNum, color: accent }}>{value}</p>
            <p style={s.statLabel}>{label}</p>
            <div style={s.statBar}>
              <div style={{
                ...s.statFill,
                width: total ? `${(value / total) * 100}%` : "0%",
                background: accent,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT: two-column layout ────────────────────────────────── */}
      <div style={s.columns}>

        {/* LEFT — recent assignments */}
        <div style={s.mainPanel} className="glass-panel">
          <div style={s.panelHead}>
            <h2 style={s.panelTitle}>Recent Assignments</h2>
            {complaints.length > 5 && (
              <Link to="/agent/complaints" style={s.viewAll}>
                View all {total} →
              </Link>
            )}
          </div>

          {complaints.length === 0 ? (
            <div style={s.emptyState}>
              <p style={s.emptyIcon}>📭</p>
              <p style={s.emptyText}>No assignments yet</p>
              <p style={s.emptySub}>An admin will assign complaints to you</p>
            </div>
          ) : (
            <div style={s.cardList}>
              {complaints.slice(0, 5).map(c => {
                const sm = STATUS_META[c.status] || {};
                const pd = PRIORITY_DOT[c.priority] || "#94a3b8";
                return (
                  <div key={c._id} style={s.assignCard} className="glass-panel hover-lift">
                    <div style={s.assignTop}>
                      <div style={s.assignTitle}>
                        <span style={{ ...s.priorityDot, background: pd }} title={c.priority} />
                        <span style={s.titleText}>{c.title}</span>
                      </div>
                      <span style={{ ...s.statusPill, background: sm.bg, color: sm.color }}>
                        {c.status}
                      </span>
                    </div>
                    <p style={s.assignDesc}>
                      {c.description?.slice(0, 90) ?? ""}
                      {(c.description?.length ?? 0) > 90 ? "…" : ""}
                    </p>
                    <div style={s.assignMeta}>
                      <span>👤 {c.user?.name || "Unknown"}</span>
                      <span>📁 {c.category}</span>
                      <span>🗓 {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — status breakdown + quick info */}
        <div style={s.sidePanel}>

          {/* Status breakdown */}
          <div style={s.sideCard} className="glass-panel">
            <h3 style={s.sideTitle}>Status Breakdown</h3>
            {Object.entries(counts).map(([status, count]) => {
              const sm = STATUS_META[status] || {};
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status} style={s.breakRow}>
                  <div style={s.breakLabel}>
                    <span style={{ ...s.breakDot, background: sm.bar }} />
                    <span style={s.breakName}>{status}</span>
                  </div>
                  <div style={s.breakRight}>
                    <div style={s.breakTrack}>
                      <div style={{ ...s.breakFill, width: `${pct}%`, background: sm.bar }} />
                    </div>
                    <span style={s.breakCount}>{count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary card */}
          <div style={s.summaryCard} className="glass-panel">
            <h3 style={s.sideTitle}>My Progress</h3>
            <div style={s.progressRow}>
              <span style={s.progressLabel}>Completion rate</span>
              <span style={s.progressPct}>
                {total ? `${Math.round((done / total) * 100)}%` : "—"}
              </span>
            </div>
            <div style={s.bigBar}>
              <div style={{
                ...s.bigFill,
                width: total ? `${(done / total) * 100}%` : "0%",
              }} />
            </div>
            <p style={s.progressSub}>
              {done} of {total} complaint{total !== 1 ? "s" : ""} resolved or closed
            </p>

            <div style={s.divider} />
            <Link to="/agent/complaints" className="btn-primary" style={s.workbenchBtn}>
              🛠 Go to Workbench
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

const s = {
  page: { padding: "2rem", maxWidth: "1600px", margin: "0 auto", fontFamily: "inherit" },
  error: { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" },

  /* Hero */
  hero: {
    background: "linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(67, 56, 202, 0.2) 100%)",
    borderRadius: "16px",
    padding: "2.25rem 2.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1.5rem",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    boxShadow: "var(--shadow-md)"
  },
  heroLeft:  { display: "flex", alignItems: "center", gap: "1.25rem" },
  avatar:    {
    width: "56px", height: "56px", borderRadius: "50%",
    background: "var(--grad-primary)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", fontWeight: "700", flexShrink: 0,
    boxShadow: "0 0 15px rgba(56, 189, 248, 0.25)",
    border: "2px solid rgba(255,255,255,0.15)",
    fontFamily: "var(--font-heading)"
  },
  heroRole:  { margin: 0, color: "#c7d2fe", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "600" },
  heroName:  { margin: "0.2rem 0", color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  heroSub:   { margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" },
  heroRight: { display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" },
  heroBadge: {
    display: "flex", alignItems: "center", gap: "0.45rem",
    background: "rgba(52, 211, 153, 0.12)", color: "#34d399",
    padding: "0.45rem 1rem", borderRadius: "24px", fontSize: "0.85rem", fontWeight: "600",
    border: "1px solid rgba(52, 211, 153, 0.25)",
  },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "#34d399", display: "inline-block",
    boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.25)",
  },
  heroBtn: {
    background: "#ffffff", color: "#0f172a",
    padding: "0.6rem 1.3rem", borderRadius: "10px",
    textDecoration: "none", fontWeight: "700", fontSize: "0.9rem",
    fontFamily: "var(--font-heading)",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(255,255,255,0.1)"
  },

  /* Stat strip */
  statStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statBox: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  statNum:   { fontSize: "2.1rem", fontWeight: "800", margin: 0, fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" },
  statLabel: { margin: "0.2rem 0 0.8rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.02em" },
  statBar:   { height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" },
  statFill:  { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },

  /* Two-column layout */
  columns: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" },

  /* Main panel */
  mainPanel: { padding: "1.75rem", boxShadow: "none" },
  panelHead:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  panelTitle: { margin: 0, color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: "800" },
  viewAll:    { color: "var(--accent-blue)", fontSize: "0.88rem", textDecoration: "none", fontWeight: "600", transition: "color 0.2s" },

  /* Empty */
  emptyState: { textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" },
  emptyIcon:  { fontSize: "3rem", margin: "0 0 0.75rem" },
  emptyText:  { margin: 0, fontSize: "1rem", fontWeight: "600", color: "var(--text-secondary)" },
  emptySub:   { margin: "0.4rem 0 0", fontSize: "0.85rem" },

  /* Assignment cards */
  cardList:   { display: "flex", flexDirection: "column", gap: "0.85rem" },
  assignCard: {
    padding: "1.2rem", background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border-subtle)"
  },
  assignTop:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" },
  assignTitle:{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 },
  priorityDot:{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  titleText:  { fontWeight: "600", color: "var(--text-primary)", fontSize: "0.98rem" },
  statusPill: { padding: "0.2rem 0.65rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700", whiteSpace: "nowrap", marginLeft: "0.5rem" },
  assignDesc: { margin: "0 0 0.75rem", color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: "1.45" },
  assignMeta: { display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", flexWrap: "wrap" },

  /* Side panel */
  sidePanel: { display: "flex", flexDirection: "column", gap: "1rem" },
  sideCard:  { padding: "1.5rem" },
  sideTitle: { margin: "0 0 1.25rem", color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: "800" },

  /* Breakdown */
  breakRow:   { marginBottom: "0.95rem" },
  breakLabel: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" },
  breakDot:   { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  breakName:  { fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" },
  breakRight: { display: "flex", alignItems: "center", gap: "0.6rem" },
  breakTrack: { flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden" },
  breakFill:  { height: "100%", borderRadius: "6px", transition: "width 0.4s ease" },
  breakCount: { fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700", minWidth: "18px", textAlign: "right" },

  /* Summary card */
  summaryCard: {
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.03) 100%)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    padding: "1.5rem",
  },
  progressRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" },
  progressLabel:{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" },
  progressPct:  { fontSize: "1.2rem", fontWeight: "800", color: "#818cf8", fontFamily: "var(--font-heading)" },
  bigBar:      { height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", overflow: "hidden", marginBottom: "0.6rem" },
  bigFill:     { height: "100%", background: "linear-gradient(90deg, #818cf8, #4f46e5)", borderRadius: "8px", transition: "width 0.4s ease" },
  progressSub: { margin: "0 0 1.25rem", fontSize: "0.8rem", color: "var(--text-secondary)" },
  divider:     { height: "1px", background: "var(--border-subtle)", marginBottom: "1.25rem" },
  workbenchBtn:{ display: "flex", width: "100%" },
};

export default AgentDashboard;
