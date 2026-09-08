import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllComplaintsAPI, updateComplaintAPI } from "../../api";
import { useAuth } from "../../context";
import { Spinner, SLABadge } from "../../components";
import { getPriorityClass, getStatusBadgeClass } from "../../utils/complaintsHelpers";

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimToast, setClaimToast] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAllComplaintsAPI();
      setAllComplaints(res.data.complaints || []);
    } catch {
      setError("Failed to load agent queue data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const myId = user?._id?.toString();

  // Filter assigned to this agent
  const myQueue = allComplaints.filter((c) => {
    if (!c.assignedTo) return false;
    const agentId = typeof c.assignedTo === "string" ? c.assignedTo : c.assignedTo._id.toString();
    return agentId === myId && c.status !== "Closed";
  });

  // Sort my queue: Overdue first, then by earliest SLA deadline
  myQueue.sort((a, b) => {
    if (a.slaBreached && !b.slaBreached) return -1;
    if (!a.slaBreached && b.slaBreached) return 1;
    const aTime = a.slaDeadline ? new Date(a.slaDeadline).getTime() : Infinity;
    const bTime = b.slaDeadline ? new Date(b.slaDeadline).getTime() : Infinity;
    return aTime - bTime;
  });

  // Unassigned / available to claim
  const unassigned = allComplaints.filter(
    (c) => !c.assignedTo && (c.status === "Open" || c.status === "In Progress")
  );

  // Resolved by this agent
  const myResolved = allComplaints.filter((c) => {
    if (!c.assignedTo) return false;
    const agentId = typeof c.assignedTo === "string" ? c.assignedTo : c.assignedTo._id.toString();
    return agentId === myId && (c.status === "Resolved" || c.status === "Closed");
  });

  // Calculate my average rating
  const ratedComplaints = myResolved.filter((c) => c.rating?.score);
  const avgRating =
    ratedComplaints.length > 0
      ? (
          ratedComplaints.reduce((acc, c) => acc + c.rating.score, 0) /
          ratedComplaints.length
        ).toFixed(1)
      : "5.0";

  const handleClaim = async (complaintId) => {
    try {
      await updateComplaintAPI(complaintId, {
        assignedTo: user._id,
        status: "In Progress",
      });
      setClaimToast("Ticket claimed and moved to your queue!");
      setTimeout(() => setClaimToast(""), 3000);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to claim ticket.");
    }
  };


  if (loading) return <Spinner />;

  return (
    <div style={styles.page}>
      {/* Toast Notification */}
      {claimToast && (
        <div style={styles.toast}>
          <i className="ti ti-check" style={{ color: "var(--resolved)" }} />
          <span>{claimToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Queue</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.name} · Support Engineer
          </p>
        </div>
        <button type="button" onClick={loadData} className="btn-ghost" style={{ height: "36px" }}>
          <i className="ti ti-refresh" /> Refresh
        </button>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      {/* Stats Row */}
      <div style={styles.statsGrid}>
        <div className="stat-card" style={{ borderTop: "3px solid var(--brand)" }}>
          <div className="stat-card-num">{myQueue.length}</div>
          <div className="stat-card-label">Assigned To Me</div>
          <div className="stat-card-trend" style={{ color: "var(--brand)" }}>
            <i className="ti ti-clock" /> Active in queue
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: "3px solid var(--resolved)" }}>
          <div className="stat-card-num">{myResolved.length}</div>
          <div className="stat-card-label">Resolved Tickets</div>
          <div className="stat-card-trend" style={{ color: "var(--resolved)" }}>
            <i className="ti ti-check" /> Resolved by you
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: "3px solid var(--open)" }}>
          <div className="stat-card-num">{unassigned.length}</div>
          <div className="stat-card-label">Available to Claim</div>
          <div className="stat-card-trend" style={{ color: "var(--open)" }}>
            <i className="ti ti-user-plus" /> Unassigned pool
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: "3px solid #E3A008" }}>
          <div className="stat-card-num">★ {avgRating}</div>
          <div className="stat-card-label">My CSAT Rating</div>
          <div className="stat-card-trend" style={{ color: "#E3A008" }}>
            <i className="ti ti-star" /> {ratedComplaints.length} ratings
          </div>
        </div>
      </div>

      {/* Two Columns (60% / 40%) */}
      <div style={styles.twoCol}>
        {/* Left Column (60%): My Active Queue */}
        <div style={styles.leftCol}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Assigned to me ({myQueue.length})</span>
              <Link to="/agent/complaints" style={styles.viewAllLink}>
                Manage Queue →
              </Link>
            </div>
            <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {myQueue.length === 0 ? (
                <div style={styles.empty}>
                  <i className="ti ti-checkup-list" style={{ fontSize: "36px", color: "var(--text-muted)", marginBottom: "6px" }} />
                  <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>No active tickets in your queue</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "2px" }}>
                    Claim unassigned tickets from the panel on the right.
                  </div>
                </div>
              ) : (
                myQueue.map((c) => (
                  <div
                    key={c._id}
                    className={`complaint-card ${getPriorityClass(c.priority)}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/agent/complaints")}
                  >
                    <div style={styles.cardRow1}>
                      <span style={styles.ticketId}>
                        #SCR-{c._id.toString().slice(-4).toUpperCase()} · {c.category} · {c.user?.name || "User"}
                      </span>
                      <span className={`badge-status ${getStatusBadgeClass(c.status)}`}>
                        <span className="badge-dot" />
                        <span>{c.status}</span>
                      </span>
                    </div>

                    <h4 style={styles.cardTitle}>{c.title}</h4>

                    <div style={styles.cardMeta}>
                      <SLABadge
                        deadline={c.slaDeadline}
                        breached={c.slaBreached}
                        status={c.status}
                        resolvedAt={c.resolvedAt}
                      />
                      <span style={styles.metaItem}>
                        Priority: <strong style={{ textTransform: "capitalize" }}>{c.priority}</strong>
                      </span>
                      <span style={{ marginLeft: "auto", color: "var(--brand)", fontSize: "12px", fontWeight: 500 }}>
                        View thread ({c.comments?.length || 0}) →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (40%): Unassigned Available to Claim */}
        <div style={styles.rightCol}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">
                Unassigned — available to claim ({unassigned.length})
              </span>
            </div>
            <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {unassigned.length === 0 ? (
                <div style={styles.empty}>
                  <i className="ti ti-inbox" style={{ fontSize: "32px", color: "var(--text-muted)", marginBottom: "6px" }} />
                  <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                    No unassigned tickets pending. All clear!
                  </div>
                </div>
              ) : (
                unassigned.map((c) => (
                  <div key={c._id} style={styles.claimCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {c.title}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        #{c._id.toString().slice(-4).toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0 10px", fontSize: "12px", color: "var(--text-secondary)" }}>
                      <span>{c.category}</span>
                      <span>·</span>
                      <span style={{ textTransform: "capitalize" }}>{c.priority}</span>
                      <span>·</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>

                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ width: "100%", height: "32px", fontSize: "12px" }}
                      onClick={() => handleClaim(c._id)}
                    >
                      <i className="ti ti-user-plus" /> Claim Complaint →
                    </button>
                  </div>
                ))
              )}
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  twoCol: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  leftCol: {
    flex: "1 1 58%",
    minWidth: "320px",
  },
  rightCol: {
    flex: "1 1 38%",
    minWidth: "280px",
  },
  viewAllLink: {
    fontSize: "12px",
    color: "var(--brand)",
    fontWeight: "500",
  },
  empty: {
    padding: "32px 16px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardRow1: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  ticketId: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: "0 0 6px",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    fontSize: "12px",
    color: "var(--text-secondary)",
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  claimCard: {
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "12px 14px",
  },
};

export default AgentDashboard;
