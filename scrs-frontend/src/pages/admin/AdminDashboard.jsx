import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardAPI } from "../../api/adminAPI";
import useAuth from "../../hooks/useAuth";
import Spinner from "../../components/common/Spinner";

const STATUS_META = {
  Open:          { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", bar: "#3b82f6" },
  "In Progress": { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", bar: "#f59e0b" },
  Resolved:      { bg: "rgba(34, 197, 94, 0.15)", color: "#34d399", bar: "#22c55e" },
  Closed:        { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8", bar: "#94a3b8" },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardAPI();
        setData(res.data.data.dashboard);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <div style={{ padding: "2rem", color: "#dc2626" }}>{error}</div>;
  if (!data)   return <div style={{ padding: "2rem", color: "#dc2626" }}>No data available</div>;

  const {
    summary          = {},
    complaintsByStatus   = [],
    complaintsByCategory = [],
    recentComplaints     = [],
  } = data;

  const totalComplaints = summary.totalComplaints || 0;

  return (
    <div style={s.page} className="animate-fade-in">

      {/* ── HERO BANNER — crimson/rose ──────────────────────────────────────── */}
      <div style={s.hero}>
        <div style={s.heroLeft}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "A"}</div>
          <div>
            <p style={s.heroRole}>Admin Portal</p>
            <h1 style={s.heroName}>{user?.name}</h1>
            <p style={s.heroSub}>System Administrator</p>
          </div>
        </div>
        <div style={s.heroRight}>
          <div style={s.heroBadge}>
            <span style={s.dot} />
            System Active
          </div>
          <Link to="/admin/complaints" style={s.heroBtn} className="hover-lift">
            Manage Complaints →
          </Link>
        </div>
      </div>

      {/* ── STAT STRIP — 4 system-wide stats ───────────────────────────────── */}
      <div style={s.statStrip} className="stat-strip-layout">
        {[
          { label: "Total Users",      value: summary.totalUsers      || 0, accent: "#f43f5e" },
          { label: "Total Agents",     value: summary.totalAgents     || 0, accent: "#fbbf24" },
          { label: "Total Complaints", value: totalComplaints,             accent: "#818cf8" },
          { label: "Resolved",
            value: complaintsByStatus.find(s => s._id === "Resolved")?.count || 0,
            accent: "#34d399" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={s.statBox} className="glass-panel hover-lift">
            <p style={{ ...s.statNum, color: accent }}>{value}</p>
            <p style={s.statLabel}>{label}</p>
            <div style={s.statBar}>
              <div style={{
                ...s.statFill,
                width: label === "Total Users" || label === "Total Agents"
                  ? "100%"
                  : totalComplaints
                    ? `${Math.min((value / totalComplaints) * 100, 100)}%`
                    : "0%",
                background: accent,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN TWO-COLUMN LAYOUT ─────────────────────────────────────────── */}
      <div style={s.columns} className="columns-layout">

        {/* LEFT — recent complaints table */}
        <div style={s.mainPanel} className="glass-panel">
          <div style={s.panelHead}>
            <h2 style={s.panelTitle}>Recent Complaints</h2>
            <Link to="/admin/complaints" style={s.viewAll}>View all →</Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div style={s.emptyState}>
              <p style={s.emptyIcon}>📭</p>
              <p style={s.emptyText}>No complaints in the system yet</p>
            </div>
          ) : (
            <div style={s.cardList}>
              {recentComplaints.map(c => {
                const sm = STATUS_META[c.status] || {};
                return (
                  <div key={c._id} style={s.complaintCard} className="glass-panel hover-lift">
                    <div style={s.cardTop}>
                      <span style={s.titleText}>{c.title}</span>
                      <span style={{ ...s.statusPill, background: sm.bg, color: sm.color }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={s.cardMeta}>
                      <span>👤 {c.user?.name || "—"}</span>
                      <span>📁 {c.category}</span>
                      <span>🗓 {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — breakdowns + quick links */}
        <div style={s.sidePanel}>

          {/* Complaints by Status */}
          <div style={s.sideCard} className="glass-panel">
            <h3 style={s.sideTitle}>By Status</h3>
            {complaintsByStatus.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No data yet</p>
            ) : complaintsByStatus.map(({ _id, count }) => {
              const sm = STATUS_META[_id] || { bar: "#94a3b8" };
              const pct = totalComplaints ? Math.round((count / totalComplaints) * 100) : 0;
              return (
                <div key={_id} style={s.breakRow}>
                  <div style={s.breakLabel}>
                    <span style={{ ...s.breakDot, background: sm.bar }} />
                    <span style={s.breakName}>{_id}</span>
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

          {/* Complaints by Category */}
          <div style={s.sideCard} className="glass-panel">
            <h3 style={s.sideTitle}>By Category</h3>
            {complaintsByCategory.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No data yet</p>
            ) : complaintsByCategory.map(({ _id, count }, i) => {
              const barColors = ["#f43f5e","#fbbf24","#818cf8","#34d399","#06b6d4"];
              const barColor  = barColors[i % barColors.length];
              const pct = totalComplaints ? Math.round((count / totalComplaints) * 100) : 0;
              return (
                <div key={_id} style={s.breakRow}>
                  <div style={s.breakLabel}>
                    <span style={{ ...s.breakDot, background: barColor }} />
                    <span style={s.breakName}>{_id}</span>
                  </div>
                  <div style={s.breakRight}>
                    <div style={s.breakTrack}>
                      <div style={{ ...s.breakFill, width: `${pct}%`, background: barColor }} />
                    </div>
                    <span style={s.breakCount}>{count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick navigation */}
          <div style={s.quickCard} className="glass-panel">
            <h3 style={s.sideTitle}>Quick Actions</h3>
            {[
              { to: "/admin/users",      icon: "👥", label: "Manage Users"      },
              { to: "/admin/agents",     icon: "🛠️", label: "Manage Agents"     },
              { to: "/admin/complaints", icon: "📋", label: "Manage Complaints"  },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} style={s.quickLink} className="hover-lift">
                <span style={s.quickIcon}>{icon}</span>
                <span style={s.quickLabel}>{label}</span>
                <span style={s.quickArrow}>→</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

const s = {
  page:  { padding: "2rem", maxWidth: "1600px", margin: "0 auto", fontFamily: "inherit" },

  /* Hero — crimson/rose theme gradient */
  hero: {
    background: "linear-gradient(135deg, rgba(159, 18, 57, 0.4) 0%, rgba(225, 29, 72, 0.15) 100%)",
    borderRadius: "16px", 
    padding: "2.25rem 2.5rem",
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: "2rem", 
    flexWrap: "wrap", 
    gap: "1.5rem",
    border: "1px solid rgba(225, 29, 72, 0.2)",
    boxShadow: "var(--shadow-md)"
  },
  heroLeft:  { display: "flex", alignItems: "center", gap: "1.25rem" },
  avatar:    {
    width: "56px", height: "56px", borderRadius: "50%",
    background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", fontWeight: "700", flexShrink: 0,
    boxShadow: "0 0 15px rgba(244, 63, 94, 0.25)",
    border: "2px solid rgba(255,255,255,0.15)",
    fontFamily: "var(--font-heading)"
  },
  heroRole:  { margin: 0, color: "#fca5a5", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "600" },
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
  statStrip: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" },
  statBox:   { padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  statNum:   { fontSize: "2.1rem", fontWeight: "800", margin: 0, fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" },
  statLabel: { margin: "0.2rem 0 0.8rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.02em" },
  statBar:   { height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" },
  statFill:  { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },

  /* Two-column */
  columns:   { display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" },

  /* Main panel */
  mainPanel: { padding: "1.75rem", boxShadow: "none" },
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  panelTitle:{ margin: 0, color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: "800" },
  viewAll:   { color: "var(--accent-blue)", fontSize: "0.88rem", textDecoration: "none", fontWeight: "600", transition: "color 0.2s" },

  /* Empty state */
  emptyState:{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" },
  emptyIcon: { fontSize: "3rem", margin: "0 0 0.75rem" },
  emptyText: { margin: 0, fontSize: "1rem", fontWeight: "600", color: "var(--text-secondary)" },

  /* Complaint cards */
  cardList:      { display: "flex", flexDirection: "column", gap: "0.85rem" },
  complaintCard: { padding: "1.2rem", background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border-subtle)" },
  cardTop:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem" },
  titleText:     { fontWeight: "600", color: "var(--text-primary)", fontSize: "0.98rem", flex: 1 },
  statusPill:    { padding: "0.2rem 0.65rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700", whiteSpace: "nowrap" },
  cardMeta:      { display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", flexWrap: "wrap" },

  /* Side panel */
  sidePanel: { display: "flex", flexDirection: "column", gap: "1rem" },
  sideCard:  { padding: "1.5rem" },
  sideTitle: { margin: "0 0 1.25rem", color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: "800" },

  /* Breakdown */
  breakRow:  { marginBottom: "0.95rem" },
  breakLabel:{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" },
  breakDot:  { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  breakName: { fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" },
  breakRight:{ display: "flex", alignItems: "center", gap: "0.6rem" },
  breakTrack:{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden" },
  breakFill: { height: "100%", borderRadius: "6px", transition: "width 0.4s ease" },
  breakCount:{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700", minWidth: "18px", textAlign: "right" },

  /* Quick links */
  quickCard: { background: "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.03) 100%)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "1.5rem" },
  quickLink: {
    display: "flex", 
    alignItems: "center", 
    gap: "0.75rem",
    padding: "0.75rem 1rem", 
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.02)", 
    textDecoration: "none", 
    color: "var(--text-primary)",
    marginBottom: "0.6rem", 
    border: "1px solid var(--border-subtle)",
    transition: "all 0.2s ease",
  },
  quickIcon:  { fontSize: "1.15rem" },
  quickLabel: { flex: 1, fontWeight: "600", fontSize: "0.9rem" },
  quickArrow: { color: "#f43f5e", fontWeight: "700" },
};

export default AdminDashboard;
