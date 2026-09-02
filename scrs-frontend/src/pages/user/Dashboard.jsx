import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllComplaintsAPI } from "../../api";
import { useAuth } from "../../context";
import { Spinner } from "../../components";
import { PageHero, StatStrip, StatusBreakdown, ComplaintCard } from "../../components/dashboard";
import { STATUS_META } from "../../utils/statusMeta";

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllComplaintsAPI();
        setComplaints(res.data.complaints);
      } catch {
        setError("Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const counts = {
    Open: complaints.filter(c => c.status === "Open").length,
    "In Progress": complaints.filter(c => c.status === "In Progress").length,
    Resolved: complaints.filter(c => c.status === "Resolved").length,
    Closed: complaints.filter(c => c.status === "Closed").length,
  };
  const total = complaints.length;
  const done = counts["Resolved"] + counts["Closed"];

  if (loading) return <Spinner />;

  const statusItems = Object.entries(counts).map(([status, count]) => ({
    _id: status,
    count,
  }));

  return (
    <div style={s.page} className="animate-fade-in">
      <PageHero
        name={user?.name}
        email={user?.email}
        role="User Portal"
        accentColor="#38bdf8"
        badgeText={`${total} Complaint${total !== 1 ? "s" : ""}`}
        actionLabel="+ Submit Complaint"
        actionTo="/complaints/new"
      />

      {error && <div style={s.error}>{error}</div>}

      <StatStrip
        stats={[
          { label: "Total", value: total, accent: "var(--accent-blue)" },
          { label: "Open", value: counts["Open"], accent: "#60a5fa" },
          { label: "In Progress", value: counts["In Progress"], accent: "#fbbf24" },
          { label: "Resolved", value: counts["Resolved"], accent: "#34d399" },
        ]}
        total={total}
      />

      <div style={s.columns} className="columns-layout">
        {/* LEFT — recent complaints */}
        <div style={s.mainPanel} className="glass-panel">
          <div style={s.panelHead}>
            <h2 style={s.panelTitle}>Recent Complaints</h2>
            {total > 5 && (
              <Link to="/complaints" style={s.viewAll}>View all {total} →</Link>
            )}
          </div>

          {total === 0 ? (
            <div style={s.emptyState}>
              <p style={s.emptyIcon}>📭</p>
              <p style={s.emptyText}>No complaints yet</p>
              <Link to="/complaints/new" style={s.emptyLink}>
                Submit your first complaint →
              </Link>
            </div>
          ) : (
            <div style={s.cardList}>
              {complaints.slice(0, 5).map(c => (
                <ComplaintCard key={c._id} complaint={c} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — status breakdown + progress */}
        <div style={s.sidePanel}>
          <StatusBreakdown
            title="Status Breakdown"
            items={statusItems}
            total={total}
          />

          <div style={s.summaryCard} className="glass-panel">
            <h3 style={s.sideTitle}>My Progress</h3>
            <div style={s.progressRow}>
              <span style={s.progressLabel}>Resolution rate</span>
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
            <Link to="/complaints" className="btn-primary" style={s.allBtn}>📋 View All Complaints</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { padding: "2rem", maxWidth: "1600px", margin: "0 auto", fontFamily: "inherit" },
  error: { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" },
  columns: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" },
  mainPanel: { padding: "1.75rem", boxShadow: "none" },
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  panelTitle: { margin: 0, color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: "800" },
  viewAll: { color: "var(--accent-blue)", fontSize: "0.88rem", textDecoration: "none", fontWeight: "600", transition: "color 0.2s" },
  emptyState: { textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" },
  emptyIcon: { fontSize: "3rem", margin: "0 0 0.75rem" },
  emptyText: { margin: 0, fontSize: "1rem", fontWeight: "600", color: "var(--text-secondary)" },
  emptyLink: { display: "inline-block", marginTop: "0.75rem", color: "var(--accent-blue)", fontWeight: "600", textDecoration: "none", fontSize: "0.9rem" },
  cardList: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  sidePanel: { display: "flex", flexDirection: "column", gap: "1rem" },
  sideTitle: { margin: "0 0 1.25rem", color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: "800" },
  summaryCard: { background: "linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0.03) 100%)", border: "1px solid rgba(14, 165, 233, 0.2)", padding: "1.5rem" },
  progressRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" },
  progressLabel: { fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" },
  progressPct: { fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-blue)", fontFamily: "var(--font-heading)" },
  bigBar: { height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", overflow: "hidden", marginBottom: "0.6rem" },
  bigFill: { height: "100%", background: "var(--grad-primary)", borderRadius: "8px", transition: "width 0.4s ease" },
  progressSub: { margin: "0 0 1.25rem", fontSize: "0.8rem", color: "var(--text-secondary)" },
  divider: { height: "1px", background: "var(--border-subtle)", marginBottom: "1.25rem" },
  allBtn: { display: "flex", width: "100%" },
};

export default Dashboard;
