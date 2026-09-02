import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardAPI } from "../../api";
import { useAuth } from "../../context";
import { Spinner } from "../../components";
import { PageHero, StatStrip, StatusBreakdown, ComplaintCard } from "../../components/dashboard";
import { Users, Shield, FileText } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  if (error) return <div style={{ padding: "2rem", color: "#dc2626" }}>{error}</div>;
  if (!data) return <div style={{ padding: "2rem", color: "#dc2626" }}>No data available</div>;

  const {
    summary = {},
    complaintsByStatus = [],
    complaintsByCategory = [],
    recentComplaints = [],
  } = data;

  const totalComplaints = summary.totalComplaints || 0;
  const resolvedCount = complaintsByStatus.find(s => s._id === "Resolved")?.count || 0;

  const CATEGORY_COLORS = ["#f43f5e", "#fbbf24", "#818cf8", "#34d399", "#06b6d4"];

  return (
    <div style={s.page} className="animate-fade-in">
      <PageHero
        name={user?.name}
        role="Admin Portal"
        accentColor="#f43f5e"
        badgeText="System Active"
        actionLabel="Manage Complaints →"
        actionTo="/admin/complaints"
      />

      <StatStrip
        stats={[
          { label: "Total Users", value: summary.totalUsers || 0, accent: "#f43f5e" },
          { label: "Total Agents", value: summary.totalAgents || 0, accent: "#fbbf24" },
          { label: "Total Complaints", value: totalComplaints, accent: "#818cf8" },
          { label: "Resolved", value: resolvedCount, accent: "#34d399" },
          { label: "SLA Breaches", value: summary.slaBreachedCount || 0, accent: summary.slaBreachedCount > 0 ? "#f43f5e" : "#10b981" },
          { label: "Avg CSAT", value: summary.avgRating ? `${summary.avgRating} ★` : "5.0 ★", accent: "#fbbf24" },
        ]}
        total={totalComplaints}
      />

      <div style={s.columns} className="columns-layout">
        {/* LEFT — recent complaints */}
        <div style={s.mainPanel} className="glass-panel">
          <div style={s.panelHead}>
            <h2 style={s.panelTitle}>Recent Complaints</h2>
            <Link to="/admin/complaints" style={s.viewAll}>View all →</Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div style={s.emptyState}>
              <p style={s.emptyIcon}><FileText size={32} color="var(--text-muted)" /></p>
              <p style={s.emptyText}>No complaints in the system yet</p>
            </div>
          ) : (
            <div style={s.cardList}>
              {recentComplaints.map(c => (
                <ComplaintCard key={c._id} complaint={c} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — breakdowns + quick links */}
        <div style={s.sidePanel}>
          <StatusBreakdown
            title="By Status"
            items={complaintsByStatus}
            total={totalComplaints}
          />

          <StatusBreakdown
            title="By Category"
            items={complaintsByCategory}
            total={totalComplaints}
            barColors={CATEGORY_COLORS}
          />

          <div style={s.quickCard} className="glass-panel">
            <h3 style={s.sideTitle}>Quick Actions</h3>
            {[
              { to: "/admin/users",      icon: Users, label: "Manage Users" },
              { to: "/admin/agents",     icon: Shield, label: "Manage Agents" },
              { to: "/admin/complaints", icon: FileText, label: "Manage Complaints" },
            ].map(({ to, icon, label }) => (
              <Link key={to} to={to} style={s.quickLink} className="hover-lift">
                {(() => { const Icon = icon; return <Icon size={18} style={{color:"var(--text-secondary)"}} />; })()}
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
  page: { padding: "2rem", maxWidth: "1600px", margin: "0 auto", fontFamily: "inherit" },
  columns: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" },
  mainPanel: { padding: "1.75rem", boxShadow: "none" },
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  panelTitle: { margin: 0, color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: "800" },
  viewAll: { color: "var(--accent-blue)", fontSize: "0.88rem", textDecoration: "none", fontWeight: "600", transition: "color 0.2s" },
  emptyState: { textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" },
  emptyIcon: { fontSize: "3rem", margin: "0 0 0.75rem" },
  emptyText: { margin: 0, fontSize: "1rem", fontWeight: "600", color: "var(--text-secondary)" },
  cardList: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  sidePanel: { display: "flex", flexDirection: "column", gap: "1rem" },
  sideTitle: { margin: "0 0 1.25rem", color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: "800" },
  quickCard: { background: "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0.03) 100%)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "1.5rem" },
  quickLink: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    padding: "0.75rem 1rem", borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.02)", textDecoration: "none",
    color: "var(--text-primary)", marginBottom: "0.6rem",
    border: "1px solid var(--border-subtle)", transition: "all 0.2s ease",
  },
  quickIcon: { fontSize: "1.15rem" },
  quickLabel: { flex: 1, fontWeight: "600", fontSize: "0.9rem" },
  quickArrow: { color: "#f43f5e", fontWeight: "700" },
};

export default AdminDashboard;
