import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllComplaintsAPI, deleteComplaintAPI, addCommentAPI, rateComplaintAPI } from "../../api";
import { Spinner, ConfirmModal, ActivityTimeline, AttachmentList, CommentThread, StarRating, SLABadge } from "../../components";
import { exportComplaintsToCSV } from "../../utils/csvExporter";
import { getPriorityClass, getStatusBadgeClass } from "../../utils/complaintsHelpers";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllComplaintsAPI();
      setComplaints(res.data.complaints || []);
    } catch {
      setError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteComplaintAPI(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      setToast("Complaint deleted successfully.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const handleAddComment = async (complaintId, text) => {
    const res = await addCommentAPI(complaintId, text);
    setComplaints((prev) =>
      prev.map((c) => (c._id === complaintId ? res.data.data : c))
    );
  };

  const handleRateComplaint = async (complaintId, score, feedback) => {
    const res = await rateComplaintAPI(complaintId, score, feedback);
    setComplaints((prev) =>
      prev.map((c) => (c._id === complaintId ? res.data.data : c))
    );
    setToast("Thank you for your rating!");
    setTimeout(() => setToast(""), 3500);
  };

  const filtered = complaints.filter((c) => {
    const matchesStatus = filter === "All" || c.status === filter;
    const matchesSearch =
      search.trim() === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });


  const getRelativeTime = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  if (loading) return <Spinner />;

  return (
    <div style={styles.page}>
      {/* Toast Notification */}
      {toast && (
        <div style={styles.toast}>
          <i className="ti ti-check" style={{ color: "var(--resolved)" }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Complaints</h1>
          <p style={styles.subtitle}>{complaints.length} tickets submitted by you</p>
        </div>
        <button
          type="button"
          onClick={() => exportComplaintsToCSV(filtered, "My_Complaints.csv")}
          className="btn-ghost"
          style={{ height: "36px" }}
        >
          <i className="ti ti-download" /> Export CSV
        </button>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      {/* Search & Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <i className="ti ti-search" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search complaints by title, category, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterTabs}>
          {["All", "Open", "In Progress", "Resolved", "Closed"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                ...styles.filterTab,
                background: filter === tab ? "var(--brand)" : "transparent",
                color: filter === tab ? "#FFFFFF" : "var(--text-secondary)",
                borderColor: filter === tab ? "var(--brand)" : "var(--border)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint List */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <i className="ti ti-clipboard-x" style={{ fontSize: "44px", color: "var(--text-muted)", marginBottom: "8px" }} />
          <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>No complaints match this filter</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            Try a different filter or submit a new ticket.
          </div>
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
                {/* Row 1: Ticket ID + Status Badge */}
                <div style={styles.cardRow1}>
                  <span style={styles.ticketId}>
                    #SCR-{c._id.toString().slice(-4).toUpperCase()} · {c.category} · {getRelativeTime(c.createdAt)}
                  </span>
                  <span className={`badge-status ${getStatusBadgeClass(c.status)}`}>
                    <span className="badge-dot" />
                    <span>{c.status}</span>
                  </span>
                </div>

                {/* Row 2: Title */}
                <h3 style={styles.cardTitle}>{c.title}</h3>

                {/* Row 3: Meta & SLA */}
                <div style={styles.cardMeta}>
                  <span style={styles.metaItem}>
                    Priority: <strong style={{ textTransform: "capitalize" }}>{c.priority}</strong>
                  </span>
                  <SLABadge
                    deadline={c.slaDeadline}
                    breached={c.slaBreached}
                    status={c.status}
                    resolvedAt={c.resolvedAt}
                  />
                  {c.assignedTo && (
                    <span style={styles.metaItem}>
                      <i className="ti ti-user-circle" /> Assigned to {c.assignedTo.name}
                    </span>
                  )}
                  {c.rating?.score && (
                    <span style={{ color: "var(--open)", fontSize: "12px", fontWeight: 600 }}>
                      ★ {c.rating.score}/5 Feedback
                    </span>
                  )}
                </div>

                {/* Row 4: Resolution Note if resolved */}
                {c.resolutionNote && !isExpanded && (
                  <div style={styles.resolutionBox}>
                    <i className="ti ti-message-check" style={{ color: "var(--resolved)" }} />
                    <span>{c.resolutionNote}</span>
                  </div>
                )}

                {/* Footer Row: Actions */}
                <div style={styles.cardFooter}>
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

                  {c.status === "Open" && (
                    <button
                      type="button"
                      onClick={() => setConfirm({ open: true, id: c._id })}
                      className="btn-danger"
                      style={{ height: "30px", fontSize: "12px", padding: "0 10px" }}
                    >
                      <i className="ti ti-trash" /> Delete
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={styles.expandedSection}>
                    <div style={styles.descBox}>
                      <div style={styles.descLabel}>FULL DESCRIPTION</div>
                      <p style={styles.descText}>{c.description}</p>
                    </div>

                    {c.resolutionNote && (
                      <div style={{ ...styles.resolutionBox, margin: "12px 0" }}>
                        <i className="ti ti-message-check" style={{ color: "var(--resolved)", fontSize: "16px" }} />
                        <div>
                          <strong>Resolution Note:</strong>
                          <div>{c.resolutionNote}</div>
                        </div>
                      </div>
                    )}

                    {/* Star Rating for resolved tickets */}
                    {(c.status === "Resolved" || c.status === "Closed") && (
                      <div style={{ margin: "14px 0" }}>
                        {c.rating?.score ? (
                          <div style={styles.ratedCard}>
                            <span style={{ color: "var(--open)", fontWeight: 600 }}>
                              You rated this resolution: ★ {c.rating.score}/5
                            </span>
                            {c.rating.feedback && (
                              <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "12px" }}>
                                "{c.rating.feedback}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <StarRating
                            rating={c.rating}
                            onRate={(score, feedback) => handleRateComplaint(c._id, score, feedback)}
                          />
                        )}
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

      <ConfirmModal
        open={confirm.open}
        message="Are you sure you want to delete this open complaint ticket?"
        onConfirm={() => handleDelete(confirm.id)}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
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
  filterBar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 300px",
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
  filterTabs: {
    display: "flex",
    gap: "4px",
  },
  filterTab: {
    padding: "0 12px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 150ms ease",
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
    marginBottom: "6px",
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
    margin: "0 0 8px",
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
  resolutionBox: {
    background: "var(--resolved-bg)",
    border: "1px solid rgba(14, 159, 110, 0.25)",
    color: "var(--resolved)",
    padding: "8px 12px",
    borderRadius: "var(--radius-md)",
    fontSize: "12px",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid var(--border)",
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
    marginTop: "14px",
    paddingTop: "14px",
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
  ratedCard: {
    background: "var(--open-bg)",
    border: "1px solid rgba(227, 160, 8, 0.25)",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
  },
};

export default MyComplaints;
