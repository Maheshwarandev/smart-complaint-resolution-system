import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllComplaintsAPI } from "../../api";
import { useAuth } from "../../context";
import { Spinner, SLABadge } from "../../components";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllComplaintsAPI();
        setComplaints(res.data.complaints || []);
      } catch {
        setError("Failed to load dashboard complaints.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const total = complaints.length;
  const openCount = complaints.filter((c) => c.status === "Open").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length;

  // SLA breakdown counts
  const activeComplaints = complaints.filter((c) => c.status === "Open" || c.status === "In Progress");
  const overdueCount = activeComplaints.filter((c) => {
    if (c.slaBreached) return true;
    if (c.slaDeadline && new Date(c.slaDeadline).getTime() < Date.now()) return true;
    return false;
  }).length;

  const criticalCount = activeComplaints.filter((c) => {
    if (!c.slaDeadline || c.slaBreached) return false;
    const diff = new Date(c.slaDeadline).getTime() - Date.now();
    return diff > 0 && diff < 4 * 3600000;
  }).length;

  const onTrackCount = activeComplaints.length - overdueCount - criticalCount;

  if (loading) return <Spinner />;

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>
            {getGreeting()}, {user?.name || "User"}
          </h1>
          <p style={styles.date}>{todayStr}</p>
        </div>
        <Link to="/complaints/new" className="btn-primary" style={{ height: "38px" }}>
          <i className="ti ti-plus" style={{ fontSize: "16px" }} />
          <span>Submit Complaint</span>
        </Link>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* SLA Overview Bar */}
      {activeComplaints.length > 0 && (
        <div style={styles.slaBar}>
          <div style={styles.slaBarLeft}>
            <i className="ti ti-clock-exclamation" style={{ fontSize: "16px", color: "var(--brand)" }} />
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>SLA Status:</span>
          </div>
          <div style={styles.slaCounts}>
            {overdueCount > 0 && (
              <span style={{ color: "var(--urgent)", fontWeight: 500 }}>
                🔴 {overdueCount} Overdue
              </span>
            )}
            {criticalCount > 0 && (
              <span style={{ color: "var(--open)", fontWeight: 500 }}>
                🟡 {criticalCount} Critical (&lt;4h)
              </span>
            )}
            <span style={{ color: "var(--resolved)", fontWeight: 500 }}>
              🟢 {Math.max(0, onTrackCount)} On track
            </span>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div style={styles.statsGrid}>
        <div className="stat-card" style={{ borderTop: "3px solid var(--brand)" }}>
          <div className="stat-card-num">{total}</div>
          <div className="stat-card-label">Total Complaints</div>
          <div className="stat-card-trend" style={{ color: "var(--brand)" }}>
            <i className="ti ti-ticket" /> All submitted tickets
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: "3px solid var(--open)" }}>
          <div className="stat-card-num">{openCount}</div>
          <div className="stat-card-label">Open Tickets</div>
          <div className="stat-card-trend" style={{ color: "var(--open)" }}>
            <i className="ti ti-clock" /> Awaiting assignment
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: "3px solid var(--progress)" }}>
          <div className="stat-card-num">{inProgressCount}</div>
          <div className="stat-card-label">In Progress</div>
          <div className="stat-card-trend" style={{ color: "var(--progress)" }}>
            <i className="ti ti-tool" /> Active support
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: "3px solid var(--resolved)" }}>
          <div className="stat-card-num">{resolvedCount}</div>
          <div className="stat-card-label">Resolved / Closed</div>
          <div className="stat-card-trend" style={{ color: "var(--resolved)" }}>
            <i className="ti ti-check" /> Completed
          </div>
        </div>
      </div>

      {/* Main Two Columns (65% / 35%) */}
      <div style={styles.twoCol}>
        {/* Left Column (65%): Recent Complaints */}
        <div style={styles.leftCol}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Recent Complaints</span>
              <Link to="/complaints" style={styles.viewAllLink}>
                View all ({total}) →
              </Link>
            </div>
            <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {complaints.length === 0 ? (
                <div style={styles.emptyState}>
                  <i className="ti ti-inbox" style={{ fontSize: "42px", color: "var(--text-muted)", marginBottom: "8px" }} />
                  <div style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: "4px" }}>
                    No complaints yet
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                    When you submit a complaint, it will appear here.
                  </div>
                  <Link to="/complaints/new" style={{ color: "var(--brand)", fontWeight: 500, fontSize: "13px" }}>
                    Submit your first complaint →
                  </Link>
                </div>
              ) : (
                complaints.slice(0, 5).map((c) => {
                  const priorityClass =
                    c.priority === "high" || c.priority === "critical"
                      ? "complaint-card-high"
                      : c.priority === "low"
                      ? "complaint-card-low"
                      : "complaint-card-medium";

                  const statusBadgeClass =
                    c.status === "Open"
                      ? "badge-open"
                      : c.status === "In Progress"
                      ? "badge-progress"
                      : c.status === "Resolved"
                      ? "badge-resolved"
                      : "badge-closed";

                  return (
                    <div
                      key={c._id}
                      className={`complaint-card ${priorityClass}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/complaints")}
                    >
                      <div style={styles.cardRow1}>
                        <span style={styles.ticketId}>
                          #SCR-{c._id.toString().slice(-4).toUpperCase()} · {c.category} ·{" "}
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`badge-status ${statusBadgeClass}`}>
                          <span className="badge-dot" />
                          <span>{c.status}</span>
                        </span>
                      </div>

                      <div style={styles.cardTitle}>{c.title}</div>

                      <div style={styles.cardMetaRow}>
                        {c.assignedTo ? (
                          <span style={styles.assignedTo}>
                            <i className="ti ti-user-circle" /> Assigned to {c.assignedTo.name}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                            Unassigned
                          </span>
                        )}
                        <SLABadge
                          deadline={c.slaDeadline}
                          breached={c.slaBreached}
                          status={c.status}
                          resolvedAt={c.resolvedAt}
                        />
                        {c.rating?.score && (
                          <span style={{ color: "var(--open)", fontSize: "12px", fontWeight: 600 }}>
                            ★ {c.rating.score}/5
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (35%): Stacked Panels */}
        <div style={styles.rightCol}>
          {/* Status Breakdown Panel */}
          <div className="panel" style={{ marginBottom: "16px" }}>
            <div className="panel-header">
              <span className="panel-title">Status Breakdown</span>
            </div>
            <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Open", count: openCount, color: "var(--open)" },
                { label: "In Progress", count: inProgressCount, color: "var(--progress)" },
                { label: "Resolved", count: resolvedCount, color: "var(--resolved)" },
              ].map((item) => {
                const pct = total > 0 ? (item.count / total) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div style={styles.breakdownRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ ...styles.breakdownDot, background: item.color }} />
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.count}
                      </span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Quick Actions</span>
            </div>
            <div>
              <Link to="/complaints/new" style={styles.actionRow}>
                <div style={styles.actionLeft}>
                  <i className="ti ti-circle-plus" style={{ fontSize: "16px", color: "var(--brand)" }} />
                  <span>Submit new complaint</span>
                </div>
                <i className="ti ti-chevron-right" style={styles.actionChevron} />
              </Link>

              <Link to="/complaints" style={styles.actionRow}>
                <div style={styles.actionLeft}>
                  <i className="ti ti-clipboard" style={{ fontSize: "16px", color: "var(--brand)" }} />
                  <span>View all my complaints</span>
                </div>
                <i className="ti ti-chevron-right" style={styles.actionChevron} />
              </Link>

              <Link to="/complaints" style={{ ...styles.actionRow, borderBottom: "none" }}>
                <div style={styles.actionLeft}>
                  <i className="ti ti-star" style={{ fontSize: "16px", color: "var(--open)" }} />
                  <span>Rate resolved complaints</span>
                </div>
                <i className="ti ti-chevron-right" style={styles.actionChevron} />
              </Link>
            </div>
          </div>
        </div>
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
  },
  greeting: {
    fontSize: "20px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: 0,
  },
  date: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: "4px 0 0",
  },
  errorAlert: {
    background: "var(--urgent-bg)",
    color: "var(--urgent)",
    border: "1px solid rgba(224, 36, 36, 0.3)",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
  },
  slaBar: {
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
  slaBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
  },
  slaCounts: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "13px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
  },
  twoCol: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  leftCol: {
    flex: "1 1 60%",
    minWidth: "320px",
  },
  rightCol: {
    flex: "1 1 32%",
    minWidth: "260px",
  },
  viewAllLink: {
    fontSize: "12px",
    color: "var(--brand)",
    fontWeight: "500",
  },
  emptyState: {
    padding: "36px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardRow1: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  ticketId: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "500",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  cardMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  assignedTo: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  breakdownDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block",
  },
  barTrack: {
    height: "4px",
    background: "var(--bg-base)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 300ms ease",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 16px",
    borderBottom: "1px solid var(--border)",
    transition: "background 120ms ease",
    textDecoration: "none",
  },
  actionLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "var(--text-primary)",
  },
  actionChevron: {
    fontSize: "12px",
    color: "var(--text-muted)",
  },
};

export default Dashboard;
