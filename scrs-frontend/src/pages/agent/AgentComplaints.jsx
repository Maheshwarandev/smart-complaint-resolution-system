import React, { useEffect, useState } from "react";
import { getAllComplaintsAPI, updateComplaintAPI, addCommentAPI } from "../../api";
import { useAuth } from "../../context";
import { Spinner, ActivityTimeline, AttachmentList, CommentThread, StarRating, SLABadge } from "../../components";
import { exportComplaintsToCSV } from "../../utils/csvExporter";
import { getPriorityClass, getStatusBadgeClass } from "../../utils/complaintsHelpers";

const AgentComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState("");

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getAllComplaintsAPI();
      const myId = user._id.toString();
      const assigned = (res.data.complaints || []).filter((c) => {
        if (!c.assignedTo) return false;
        const agentId = typeof c.assignedTo === "string" ? c.assignedTo : c.assignedTo._id.toString();
        return agentId === myId;
      });
      setComplaints(assigned);
    } catch {
      setError("Failed to load assigned complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await updateComplaintAPI(complaintId, { status: newStatus });
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: newStatus } : c))
      );
      setToast(`Status updated to "${newStatus}"`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed.");
    }
  };

  const handleAddComment = async (complaintId, text) => {
    const res = await addCommentAPI(complaintId, text);
    setComplaints((prev) =>
      prev.map((c) => (c._id === complaintId ? res.data.data : c))
    );
  };

  const filtered = complaints.filter((c) => {
    return (
      search.trim() === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      (c.user?.name || "").toLowerCase().includes(search.toLowerCase())
    );
  });


  if (loading) return <Spinner />;

  return (
    <div style={styles.page}>
      {toast && (
        <div style={styles.toast}>
          <i className="ti ti-check" style={{ color: "var(--resolved)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Assigned Queue</h1>
          <p style={styles.subtitle}>{complaints.length} complaints assigned to your queue</p>
        </div>
        <button
          type="button"
          onClick={() => exportComplaintsToCSV(filtered, "Agent_Queue_Report.csv")}
          className="btn-ghost"
          style={{ height: "36px" }}
        >
          <i className="ti ti-download" /> Export CSV
        </button>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      {/* Search Bar */}
      <div style={styles.searchWrap}>
        <i className="ti ti-search" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search assigned tickets by title, category, complainant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Complaint List */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <i className="ti ti-inbox" style={{ fontSize: "40px", color: "var(--text-muted)", marginBottom: "8px" }} />
          <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>No tickets found in your queue</div>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((c) => {
            const isExpanded = expandedId === c._id;

            return (
              <div
                key={c._id}
                className={`complaint-card ${getPriorityClass(c.priority)}`}
              >
                {/* Top Row */}
                <div style={styles.cardRow1}>
                  <span style={styles.ticketId}>
                    #SCR-{c._id.toString().slice(-4).toUpperCase()} · Complainant: {c.user?.name || "User"} ({c.user?.email || "N/A"})
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`badge-status ${getStatusBadgeClass(c.status)}`}>
                      <span className="badge-dot" />
                      <span>{c.status}</span>
                    </span>
                  </div>
                </div>

                <h3 style={styles.cardTitle}>{c.title}</h3>

                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>Category: {c.category}</span>
                  <span style={styles.metaItem}>
                    Priority: <strong style={{ textTransform: "capitalize" }}>{c.priority}</strong>
                  </span>
                  <SLABadge
                    deadline={c.slaDeadline}
                    breached={c.slaBreached}
                    status={c.status}
                    resolvedAt={c.resolvedAt}
                  />
                  <span>Submitted: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Inline Status Action */}
                <div style={styles.cardActionsRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Update status:</span>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : c._id)}
                    style={styles.threadBtn}
                  >
                    <i className={isExpanded ? "ti ti-chevron-up" : "ti ti-message-circle"} />
                    <span>
                      {isExpanded ? "Hide conversation" : `View thread (${c.comments?.length || 0}) →`}
                    </span>
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={styles.expandedSection}>
                    <div style={styles.descBox}>
                      <div style={styles.descLabel}>DESCRIPTION</div>
                      <p style={styles.descText}>{c.description}</p>
                    </div>

                    {c.rating?.score && (
                      <div style={{ margin: "10px 0" }}>
                        <StarRating rating={c.rating} readonly={true} />
                      </div>
                    )}

                    <AttachmentList attachments={c.attachments} />

                    <CommentThread
                      comments={c.comments}
                      onAddComment={(text) => handleAddComment(c._id, text)}
                    />

                    <ActivityTimeline history={c.history} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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
    margin: "0 0 2px",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: 0,
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
  searchWrap: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    fontSize: "14px",
  },
  searchInput: {
    paddingLeft: "34px",
    height: "38px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  empty: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "48px 16px",
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
    gap: "12px",
    flexWrap: "wrap",
    fontSize: "12px",
    color: "var(--text-secondary)",
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  cardActionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid var(--border)",
  },
  statusSelect: {
    height: "30px",
    fontSize: "12px",
    width: "120px",
    padding: "0 8px",
  },
  threadBtn: {
    background: "transparent",
    border: "none",
    color: "var(--brand)",
    fontSize: "13px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    padding: 0,
  },
  expandedSection: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px dashed var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  descBox: {
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "12px 14px",
  },
  descLabel: {
    fontSize: "10px",
    color: "var(--text-muted)",
    letterSpacing: "0.08em",
    fontWeight: "600",
    marginBottom: "4px",
  },
  descText: {
    fontSize: "13px",
    color: "var(--text-primary)",
    lineHeight: "1.6",
    margin: 0,
  },
};

export default AgentComplaints;
