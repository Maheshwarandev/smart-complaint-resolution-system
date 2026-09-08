import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardAPI, getAllComplaintsAPI } from "../../api";
import { useAuth } from "../../context";
import { Spinner, SLABadge } from "../../components";
import { exportComplaintsToCSV } from "../../utils/csvExporter";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadData = async () => {
    try {
      const [dashRes, compRes] = await Promise.all([
        getDashboardAPI(),
        getAllComplaintsAPI(),
      ]);
      setData(dashRes.data?.data?.dashboard || {});
      setAllComplaints(compRes.data?.complaints || []);
    } catch (err) {
      setError("Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleExport = () => {
    if (!allComplaints || allComplaints.length === 0) {
      alert("No complaint records to export.");
      return;
    }
    exportComplaintsToCSV(allComplaints, "System_Complaints_Report.csv");
    setToast("System Complaints Report exported successfully!");
    setTimeout(() => setToast(""), 3500);
  };

  if (loading) return <Spinner />;

  const {
    summary = {},
    complaintsByStatus = [],
    complaintsByCategory = [],
    recentComplaints = [],
  } = data || {};

  const totalComplaints = summary.totalComplaints || 0;
  const overdueCount = summary.slaBreachedCount || 0;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "badge-open";
      case "In Progress":
        return "badge-progress";
      case "Resolved":
        return "badge-resolved";
      default:
        return "badge-closed";
    }
  };

  return (
    <div style={styles.page}>
      {/* Toast Alert */}
      {toast && (
        <div style={styles.toast}>
          <i className="ti ti-check" style={{ color: "var(--resolved)", fontSize: "16px" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Overview</h1>
          <p style={styles.subtitle}>{todayStr} · System Administration</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            onClick={loadData}
            className="btn-ghost"
            style={{ height: "36px" }}
            title="Refresh dashboard metrics"
          >
            <i className="ti ti-refresh" /> Refresh
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="btn-primary"
            style={{ height: "36px" }}
            title="Export CSV report of all complaints"
          >
            <i className="ti ti-download" /> Export Report
          </button>
        </div>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      {/* SLA Overview Bar */}
      <div style={styles.slaOverviewBar}>
        <div style={styles.slaLeft}>
          <i className="ti ti-clock" style={{ fontSize: "16px", color: "var(--brand)" }} />
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>SLA Overview:</span>
        </div>
        <div style={styles.slaPillsRow}>
          <button
            type="button"
            onClick={() => navigate("/admin/complaints?filter=overdue")}
            style={styles.slaPillOverdue}
            title="Click to view all overdue complaints"
          >
            🔴 {overdueCount} Overdue →
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/complaints")}
            style={styles.slaPillOnTrack}
            title="Click to view on-track complaints"
          >
            🟢 {Math.max(0, totalComplaints - overdueCount)} On track →
          </button>
          {summary.avgRating && (
            <button
              type="button"
              onClick={() => navigate("/admin/agents")}
              style={styles.slaPillRating}
              title="Click to view agent performance & CSAT ratings"
            >
              ★ {summary.avgRating}/5 Avg CSAT ({summary.totalRatings || 0} reviews) →
            </button>
          )}
        </div>
      </div>

      {/* 3 Main Clickable Stats Cards */}
      <div style={styles.statsGrid}>
        <div
          className="stat-card"
          style={{ ...styles.clickableCard, borderTop: "3px solid var(--brand)" }}
          onClick={() => navigate("/admin/users")}
          title="Click to manage users"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-num">{summary.totalUsers || 0}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
            <i className="ti ti-arrow-up-right" style={styles.cardArrow} />
          </div>
          <div className="stat-card-trend" style={{ color: "var(--brand)" }}>
            <i className="ti ti-users" /> Registered employees · Manage →
          </div>
        </div>

        <div
          className="stat-card"
          style={{ ...styles.clickableCard, borderTop: "3px solid #06b6d4" }}
          onClick={() => navigate("/admin/agents")}
          title="Click to manage support agents"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-num">{summary.totalAgents || 0}</div>
              <div className="stat-card-label">Support Agents</div>
            </div>
            <i className="ti ti-arrow-up-right" style={styles.cardArrow} />
          </div>
          <div className="stat-card-trend" style={{ color: "#06b6d4" }}>
            <i className="ti ti-shield" /> Active resolvers · Manage →
          </div>
        </div>

        <div
          className="stat-card"
          style={{ ...styles.clickableCard, borderTop: "3px solid var(--progress)" }}
          onClick={() => navigate("/admin/complaints")}
          title="Click to view all complaints"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="stat-card-num">{totalComplaints}</div>
              <div className="stat-card-label">Total Complaints</div>
            </div>
            <i className="ti ti-arrow-up-right" style={styles.cardArrow} />
          </div>
          <div className="stat-card-trend" style={{ color: "var(--progress)" }}>
            <i className="ti ti-ticket" /> Lifetime tickets · View →
          </div>
        </div>
      </div>

      {/* Breakdown Panels (Side by Side) */}
      <div style={styles.twoCol}>
        {/* By Status Panel */}
        <div className="panel" style={{ flex: 1 }}>
          <div className="panel-header">
            <span className="panel-title">Complaints by Status</span>
            <Link
              to="/admin/complaints"
              style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 500 }}
            >
              View all →
            </Link>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {complaintsByStatus.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No complaints data</div>
            ) : (
              complaintsByStatus.map((s) => {
                const pct = totalComplaints > 0 ? (s.count / totalComplaints) * 100 : 0;
                const col =
                  s._id === "Open"
                    ? "var(--open)"
                    : s._id === "In Progress"
                    ? "var(--progress)"
                    : s._id === "Resolved"
                    ? "var(--resolved)"
                    : "var(--closed)";
                return (
                  <div
                    key={s._id}
                    style={styles.clickableBreakdownRow}
                    onClick={() => navigate(`/admin/complaints?status=${encodeURIComponent(s._id)}`)}
                    title={`Click to filter complaints with status: ${s._id}`}
                  >
                    <div style={styles.barLabelRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: col }} />
                        <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {s._id}
                        </span>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {s.count} <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${pct}%`, background: col }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* By Category Panel */}
        <div className="panel" style={{ flex: 1 }}>
          <div className="panel-header">
            <span className="panel-title">Complaints by Category</span>
            <Link
              to="/admin/complaints"
              style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 500 }}
            >
              View all →
            </Link>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {complaintsByCategory.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No categories data</div>
            ) : (
              complaintsByCategory.slice(0, 5).map((cat) => {
                const pct = totalComplaints > 0 ? (cat.count / totalComplaints) * 100 : 0;
                return (
                  <div
                    key={cat._id}
                    style={styles.clickableBreakdownRow}
                    onClick={() => navigate(`/admin/complaints?category=${encodeURIComponent(cat._id)}`)}
                    title={`Click to filter complaints in category: ${cat._id}`}
                  >
                    <div style={styles.barLabelRow}>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)", textTransform: "capitalize", fontWeight: 500 }}>
                        {cat._id}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {cat.count} <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${pct}%`, background: "var(--brand)" }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Recent Complaints</span>
          <Link to="/admin/complaints" style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 500 }}>
            Manage all tickets →
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>SLA Target</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyTd}>
                    No complaints in the system yet.
                  </td>
                </tr>
              ) : (
                recentComplaints.map((c) => (
                  <tr
                    key={c._id}
                    style={styles.tr}
                    onClick={() => navigate(`/admin/complaints?id=${c._id}`)}
                    title="Click to manage this complaint"
                  >
                    <td style={{ ...styles.td, fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                      #SCR-{c._id.toString().slice(-4).toUpperCase()}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 500, color: "var(--text-primary)" }}>
                      {c.title}
                    </td>
                    <td style={styles.td}>{c.user?.name || "User"}</td>
                    <td style={{ ...styles.td, textTransform: "capitalize" }}>{c.category}</td>
                    <td style={styles.td}>
                      <span className={`badge-status ${getStatusBadgeClass(c.status)}`}>
                        <span className="badge-dot" />
                        <span>{c.status}</span>
                      </span>
                    </td>
                    <td style={styles.td}>
                      <SLABadge
                        deadline={c.slaDeadline}
                        breached={c.slaBreached}
                        status={c.status}
                        resolvedAt={c.resolvedAt}
                      />
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <span style={{ color: "var(--brand)", fontSize: "12px", fontWeight: 500 }}>
                        Open →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Grid (3 Columns) */}
      <div style={styles.actionsGrid}>
        <Link to="/admin/users" style={styles.actionCard}>
          <div style={styles.actionIconWrap}>
            <i className="ti ti-user-plus" style={{ fontSize: "20px", color: "var(--brand)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Users Directory</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Manage accounts & roles</div>
          </div>
          <i className="ti ti-chevron-right" style={{ color: "var(--text-muted)", fontSize: "14px" }} />
        </Link>

        <Link to="/admin/agents" style={styles.actionCard}>
          <div style={{ ...styles.actionIconWrap, background: "rgba(6, 182, 212, 0.12)", border: "1px solid rgba(6, 182, 212, 0.25)" }}>
            <i className="ti ti-shield" style={{ fontSize: "20px", color: "#06b6d4" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Support Engineers</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Manage agent passkeys</div>
          </div>
          <i className="ti ti-chevron-right" style={{ color: "var(--text-muted)", fontSize: "14px" }} />
        </Link>

        <Link to="/admin/complaints" style={styles.actionCard}>
          <div style={{ ...styles.actionIconWrap, background: "rgba(227, 160, 8, 0.12)", border: "1px solid rgba(227, 160, 8, 0.25)" }}>
            <i className="ti ti-clipboard" style={{ fontSize: "20px", color: "var(--open)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>All Complaints</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Assign & update statuses</div>
          </div>
          <i className="ti ti-chevron-right" style={{ color: "var(--text-muted)", fontSize: "14px" }} />
        </Link>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: "4px 0 0",
  },
  toast: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderLeft: "4px solid var(--resolved)",
    borderRadius: "var(--radius-lg)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-primary)",
  },
  alertError: {
    background: "var(--urgent-bg)",
    color: "var(--urgent)",
    border: "1px solid rgba(224, 36, 36, 0.3)",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
  },
  slaOverviewBar: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
  },
  slaLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
  },
  slaPillsRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  slaPillOverdue: {
    background: "var(--urgent-bg)",
    color: "var(--urgent)",
    border: "1px solid rgba(224, 36, 36, 0.3)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "transform 100ms ease, background 150ms ease",
  },
  slaPillOnTrack: {
    background: "var(--resolved-bg)",
    color: "var(--resolved)",
    border: "1px solid rgba(14, 159, 110, 0.3)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "transform 100ms ease, background 150ms ease",
  },
  slaPillRating: {
    background: "var(--open-bg)",
    color: "var(--open)",
    border: "1px solid rgba(227, 160, 8, 0.3)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "transform 100ms ease, background 150ms ease",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  clickableCard: {
    cursor: "pointer",
    transition: "transform 150ms ease, border-color 150ms ease, background 150ms ease",
  },
  cardArrow: {
    color: "var(--text-muted)",
    fontSize: "14px",
    transition: "transform 150ms ease",
  },
  twoCol: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  clickableBreakdownRow: {
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: "var(--radius-md)",
    transition: "background 150ms ease",
  },
  barLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  barTrack: {
    height: "6px",
    background: "var(--bg-base)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 300ms ease",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "13px",
  },
  th: {
    padding: "10px 14px",
    background: "var(--bg-surface)",
    color: "var(--text-muted)",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    borderBottom: "1px solid var(--border)",
  },
  tr: {
    cursor: "pointer",
    transition: "background 120ms ease",
  },
  td: {
    padding: "12px 14px",
    color: "var(--text-primary)",
    borderBottom: "1px solid var(--border)",
  },
  emptyTd: {
    padding: "24px 14px",
    textAlign: "center",
    color: "var(--text-muted)",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  actionCard: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    transition: "background 150ms ease, border-color 150ms ease, transform 100ms ease",
  },
  actionIconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    background: "var(--brand-subtle)",
    border: "1px solid var(--brand-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default AdminDashboard;
