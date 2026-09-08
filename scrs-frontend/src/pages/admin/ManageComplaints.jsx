import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAllComplaintsAPI,
  updateComplaintAPI,
  addCommentAPI,
  getAllAgentsAPI,
  assignComplaintAPI,
} from "../../api";
import {
  Spinner,
  ActivityTimeline,
  AttachmentList,
  CommentThread,
  StarRating,
  SLABadge,
} from "../../components";
import { exportComplaintsToCSV } from "../../utils/csvExporter";

const ManageComplaints = () => {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || (searchParams.get("filter") === "overdue" ? "Overdue" : "All"));
  const [search, setSearch] = useState(searchParams.get("category") || searchParams.get("search") || "");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [expandedId, setExpandedId] = useState(searchParams.get("id") || null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const filterParam = searchParams.get("filter");
    const catParam = searchParams.get("category");
    const idParam = searchParams.get("id");

    if (statusParam) setFilter(statusParam);
    else if (filterParam === "overdue") setFilter("Overdue");

    if (catParam) setSearch(catParam);
    if (idParam) setExpandedId(idParam);
  }, [searchParams]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          getAllComplaintsAPI(),
          getAllAgentsAPI(),
        ]);
        setComplaints(cRes.data.complaints || []);
        setAgents(aRes.data.agents || []);
      } catch {
        setError("Failed to load complaints and agent directory.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateComplaintAPI(id, { status });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      setToast(`Updated ticket status to "${status}"`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed.");
    }
  };

  const handleAssign = async (complaintId, agentId) => {
    if (!agentId) return;
    try {
      const res = await assignComplaintAPI(complaintId, { agentId });
      const updated = res.data.complaint;
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? updated : c))
      );
      setToast("Agent assigned successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed.");
    }
  };

  const handleAddComment = async (complaintId, text) => {
    const res = await addCommentAPI(complaintId, text);
    setComplaints((prev) =>
      prev.map((c) => (c._id === complaintId ? res.data.data : c))
    );
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (newStatus) => {
    try {
      await Promise.all(
        selectedIds.map((id) => updateComplaintAPI(id, { status: newStatus }))
      );
      setComplaints((prev) =>
        prev.map((c) =>
          selectedIds.includes(c._id) ? { ...c, status: newStatus } : c
        )
      );
      setToast(`Bulk updated ${selectedIds.length} tickets to "${newStatus}"`);
      setSelectedIds([]);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert("Bulk status update failed.");
    }
  };

  const filtered = complaints.filter((c) => {
    let matchesStatus = filter === "All" || c.status === filter;
    if (filter === "Overdue") {
      const isPastDeadline = c.slaDeadline && new Date(c.slaDeadline).getTime() < Date.now();
      matchesStatus = (c.slaBreached || isPastDeadline) && c.status !== "Resolved" && c.status !== "Closed";
    }
    const matchesSearch =
      search.trim() === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      (c.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.assignedTo?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getPriorityClass = (priority) => {
    if (priority === "high" || priority === "critical") return "complaint-card-high";
    if (priority === "low") return "complaint-card-low";
    return "complaint-card-medium";
  };

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
          <h1 style={styles.title}>All System Complaints</h1>
          <p style={styles.subtitle}>
            {complaints.length} total tickets registered across all users
          </p>
        </div>

        {selectedIds.length > 0 ? (
          <div style={styles.bulkToolbar}>
            <span style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 600 }}>
              {selectedIds.length} selected
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatus(e.target.value);
              }}
              defaultValue=""
              style={styles.bulkSelect}
            >
              <option value="" disabled>
                Bulk Status ▾
              </option>
              <option value="Open">Set Open</option>
              <option value="In Progress">Set In Progress</option>
              <option value="Resolved">Set Resolved</option>
              <option value="Closed">Set Closed</option>
            </select>
            <button
              type="button"
              onClick={() =>
                exportComplaintsToCSV(
                  complaints.filter((c) => selectedIds.includes(c._id)),
                  "Selected_Complaints.csv"
                )
              }
              className="btn-ghost"
              style={{ height: "30px", fontSize: "12px", padding: "0 8px" }}
            >
              <i className="ti ti-download" /> Export
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={styles.clearBtn}
            >
              ✕ Clear
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => exportComplaintsToCSV(filtered, "All_System_Complaints.csv")}
            className="btn-ghost"
            style={{ height: "36px" }}
          >
            <i className="ti ti-download" /> Export CSV
          </button>
        )}
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      {/* Search & Tabs */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <i className="ti ti-search" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search all complaints by title, category, complainant, or assigned agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterTabs}>
          {["All", "Open", "In Progress", "Resolved", "Closed", "Overdue"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                ...styles.filterTab,
                background: filter === tab ? (tab === "Overdue" ? "var(--urgent)" : "var(--brand)") : "transparent",
                color: filter === tab ? "#FFFFFF" : (tab === "Overdue" ? "var(--urgent)" : "var(--text-secondary)"),
                borderColor: filter === tab ? (tab === "Overdue" ? "var(--urgent)" : "var(--brand)") : "var(--border)",
              }}
            >
              {tab === "Overdue" ? "🔴 Overdue" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint List */}
      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <i className="ti ti-clipboard-x" style={{ fontSize: "40px", color: "var(--text-muted)", marginBottom: "8px" }} />
          <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>No complaints match this filter</div>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((c) => {
            const isExpanded = expandedId === c._id;
            const isChecked = selectedIds.includes(c._id);

            return (
              <div
                key={c._id}
                className={`complaint-card ${getPriorityClass(c.priority)}`}
                style={{
                  borderColor: isChecked ? "var(--brand)" : undefined,
                }}
              >
                {/* Top Row: Checkbox + Meta + Status */}
                <div style={styles.cardRow1}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      className="complaint-checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(c._id)}
                    />
                    <span style={styles.ticketId}>
                      #SCR-{c._id.toString().slice(-4).toUpperCase()} · 👤 {c.user?.name || "User"} · 📁 {c.category} · {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className={`badge-status ${getStatusBadgeClass(c.status)}`}>
                    <span className="badge-dot" />
                    <span>{c.status}</span>
                  </span>
                </div>

                <h3 style={styles.cardTitle}>{c.title}</h3>

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
                  {c.rating?.score && (
                    <span style={{ color: "var(--open)", fontSize: "12px", fontWeight: 600 }}>
                      ★ {c.rating.score}/5 Rating
                    </span>
                  )}
                </div>

                {/* Inline Select Controls for Admin */}
                <div style={styles.cardActionsRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    {/* Status dropdown */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Status:</span>
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                        style={styles.compactSelect}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    {/* Assign Agent dropdown */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Assign:</span>
                      <select
                        value={c.assignedTo?._id || c.assignedTo || ""}
                        onChange={(e) => handleAssign(c._id, e.target.value)}
                        style={styles.compactSelectAgent}
                      >
                        <option value="">Unassigned</option>
                        {agents.map((ag) => (
                          <option key={ag._id} value={ag._id}>
                            {ag.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      <div style={styles.descLabel}>FULL DESCRIPTION</div>
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
    flexWrap: "wrap",
    gap: "12px",
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
  bulkToolbar: {
    background: "var(--brand-subtle)",
    border: "1px solid var(--brand-muted)",
    borderRadius: "var(--radius-md)",
    padding: "6px 12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  bulkSelect: {
    height: "30px",
    fontSize: "12px",
    padding: "0 8px",
    width: "130px",
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "12px",
    cursor: "pointer",
  },
  filterBar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 320px",
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
    flexWrap: "wrap",
    gap: "8px",
  },
  compactSelect: {
    height: "30px",
    fontSize: "12px",
    width: "120px",
    padding: "0 8px",
  },
  compactSelectAgent: {
    height: "30px",
    fontSize: "12px",
    width: "140px",
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

export default ManageComplaints;
