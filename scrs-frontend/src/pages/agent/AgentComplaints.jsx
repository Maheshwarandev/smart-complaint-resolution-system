import { useEffect, useState } from "react";
import { getAllComplaintsAPI, updateComplaintAPI } from "../../api/complaintAPI";
import useAuth from "../../hooks/useAuth";
import Spinner from "../../components/common/Spinner";
import ActivityTimeline from "../../components/common/ActivityTimeline";
import AttachmentList from "../../components/common/AttachmentList";

const STATUS_COLORS = {
  Open: { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
  "In Progress": { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
  Resolved: { bg: "rgba(34, 197, 94, 0.15)", color: "#34d399" },
  Closed: { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" },
};

const PRIORITY_COLORS = {
  High: { color: "#dc2626" },
  Medium: { color: "#d97706" },
  Low: { color: "#16a34a" },
};

const STATUS_FLOW = ["Open", "In Progress", "Resolved", "Closed"];

const AgentComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await getAllComplaintsAPI();
        const myId = user._id.toString();
        // Filter complaints assigned to this agent
        // assignedTo can be either a string (ID) or an object (populated user)
        const assigned = res.data.complaints.filter(c => {
          if (!c.assignedTo) return false;
          const agentId = typeof c.assignedTo === 'string'
            ? c.assignedTo
            : c.assignedTo._id.toString();
          return agentId === myId;
        });
        setComplaints(assigned);
      } catch {
        setError("Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await updateComplaintAPI(complaintId, { status: newStatus });
      setComplaints(prev =>
        prev.map(c => c._id === complaintId ? { ...c, status: newStatus } : c)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed.");
    }
  };

  const handleSaveEdit = async (complaintId) => {
    try {
      await updateComplaintAPI(complaintId, editData);
      setComplaints(prev =>
        prev.map(c => c._id === complaintId ? { ...c, ...editData } : c)
      );
      setEditingId(null);
      setEditData({});
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <Spinner />;

  const s = styles;
  return (
    <div style={s.page} className="animate-fade-in">
      <h1 style={s.title}>My Assigned Complaints</h1>
      <p style={s.sub}>{complaints.length} complaints assigned to you</p>

      {error && <div style={s.error}>{error}</div>}

      {complaints.length === 0 ? (
        <div style={s.empty} className="glass-panel">
          No complaints assigned yet. You will see them here once an admin assigns them to you.
        </div>
      ) : (
        <div style={s.list}>
          {complaints.map((c) => {
            const sc = STATUS_COLORS[c.status] || {};
            const pc = PRIORITY_COLORS[c.priority] || {};
            const isExpanded = expandedId === c._id;
            const isEditing = editingId === c._id;

            return (
              <div key={c._id} style={s.card} className="glass-panel">
                {/* Header Row */}
                <div
                  style={s.cardHeader}
                  onClick={() => setExpandedId(isExpanded ? null : c._id)}
                >
                  <div style={s.cardTitle}>
                    <h3 style={s.title3}>{c.title}</h3>
                    <span
                      style={{
                        ...s.badge,
                        background: sc.bg,
                        color: sc.color,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <span style={{ fontSize: "1.1rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={s.details}>
                    {/* Basic Info */}
                    <div style={s.infoGrid}>
                      <div>
                        <p style={s.label}>Complainant</p>
                        <p style={s.value}>{c.user?.name}</p>
                      </div>
                      <div>
                        <p style={s.label}>Category</p>
                        <p style={s.value}>{c.category}</p>
                      </div>
                      <div>
                        <p style={s.label}>Priority</p>
                        <p style={{ ...s.value, color: pc.color, fontWeight: "700" }}>
                          {c.priority}
                        </p>
                      </div>
                      <div>
                        <p style={s.label}>Submitted</p>
                        <p style={s.value}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={s.section}>
                      <p style={s.label}>Description</p>
                      <p style={s.description}>{c.description}</p>
                    </div>

                    {/* Attachments */}
                    <AttachmentList attachments={c.attachments} />

                    {/* Timeline */}
                    <ActivityTimeline history={c.history} />

                    {/* Status Change */}
                    <div style={s.section}>
                      <p style={s.label}>Change Status</p>
                      <div style={s.statusButtons}>
                        {STATUS_FLOW.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(c._id, status)}
                            style={{
                              ...s.statusBtn,
                              ...(c.status === status ? s.statusBtnActive : {}),
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Edit Fields */}
                    {!isEditing ? (
                      <>
                        {/* Priority Display */}
                        <div style={s.section}>
                          <div style={s.sectionHeader}>
                            <p style={s.label}>Priority</p>
                            <button
                              onClick={() => {
                                setEditingId(c._id);
                                setEditData({
                                  priority: c.priority,
                                  resolutionNote: c.resolutionNote || "",
                                });
                              }}
                              style={s.editBtn}
                            >
                              ✏️ Edit Priority & Note
                            </button>
                          </div>
                          <p style={{ ...s.value, color: pc.color, fontWeight: "700" }}>
                            {c.priority}
                          </p>
                        </div>

                        {/* Resolution Note Display */}
                        <div style={s.section}>
                          <p style={s.label}>Resolution Note</p>
                          <p style={s.description}>
                            {c.resolutionNote || "No notes yet"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Edit Priority */}
                        <div style={s.section}>
                          <label style={s.label}>Priority</label>
                          <select
                            value={editData.priority}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                priority: e.target.value,
                              })
                            }
                            className="input-field"
                            style={s.select}
                          >
                            <option value="Low" style={s.option}>Low</option>
                            <option value="Medium" style={s.option}>Medium</option>
                            <option value="High" style={s.option}>High</option>
                          </select>
                        </div>

                        {/* Edit Resolution Note */}
                        <div style={s.section}>
                          <label style={s.label}>Resolution Note</label>
                          <textarea
                            value={editData.resolutionNote}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                resolutionNote: e.target.value,
                              })
                            }
                            className="input-field"
                            style={{ height: "100px" }}
                            placeholder="Add resolution details..."
                          />
                        </div>

                        {/* Save/Cancel Buttons */}
                        <div style={s.buttonGroup}>
                          <button
                            onClick={() => handleSaveEdit(c._id)}
                            style={s.saveBtn}
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditData({});
                            }}
                            style={s.cancelBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
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
  page: { padding: "2rem", maxWidth: "900px", margin: "0 auto" },
  title: { margin: "0 0 0.25rem", color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  title3: { margin: "0", color: "var(--text-primary)", fontSize: "1.15rem", fontWeight: "700" },
  sub: { margin: "0 0 1.5rem", color: "var(--text-secondary)" },
  error: {
    background: "rgba(244, 63, 94, 0.1)",
    color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.2)",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.88rem"
  },
  empty: {
    padding: "3rem",
    color: "var(--text-secondary)",
    textAlign: "center",
  },

  // List and cards
  list: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  card: {
    borderRadius: "16px",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    cursor: "pointer",
  },
  cardTitle: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    flex: 1,
  },
  badge: {
    padding: "0.2rem 0.65rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  // Details
  details: { padding: "1.5rem", borderTop: "1px solid var(--border-subtle)", background: "rgba(0,0,0,0.08)" },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  label: {
    margin: "0 0 0.35rem",
    color: "var(--text-muted)",
    fontSize: "0.75rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  value: { margin: "0", color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: "600" },
  description: {
    margin: "0",
    color: "var(--text-secondary)",
    fontSize: "0.92rem",
    lineHeight: "1.5",
    padding: "0.8rem 1rem",
    background: "rgba(255,255,255,0.015)",
    borderRadius: "8px",
    border: "1px solid var(--border-subtle)"
  },

  // Sections
  section: { marginBottom: "1.5rem" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },

  // Status buttons
  statusButtons: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  statusBtn: {
    padding: "0.45rem 1rem",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  statusBtnActive: {
    background: "var(--grad-primary)",
    color: "#fff",
    border: "1px solid transparent",
  },

  // Form controls
  editBtn: {
    padding: "0.35rem 0.8rem",
    background: "var(--grad-primary)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: "600"
  },
  select: {
    cursor: "pointer",
  },
  option: {
    background: "var(--bg-sidebar)",
    color: "var(--text-primary)"
  },

  // Buttons
  buttonGroup: { display: "flex", gap: "0.75rem", marginTop: "1rem" },
  saveBtn: {
    flex: 1,
    padding: "0.7rem",
    background: "var(--grad-success)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "var(--font-heading)"
  },
  cancelBtn: {
    flex: 1,
    padding: "0.7rem",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "var(--font-heading)"
  },

  attachmentList:  { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" },
  attachmentBtn:   { background: "rgba(56, 189, 248, 0.1)", color: "var(--accent-blue)", padding: "0.4rem 0.8rem", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: "500", border: "1px solid rgba(56, 189, 248, 0.2)" },
  
  timeline:        { display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "2px solid var(--border-subtle)", paddingLeft: "1.2rem", marginLeft: "0.5rem", marginTop: "0.5rem" },
  timelineItem:    { position: "relative" },
  timelineDot:     { position: "absolute", left: "-1.55rem", top: "0.3rem", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-blue)", border: "2px solid var(--bg-app)" },
  timelineContent: { background: "rgba(255,255,255,0.01)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" },
  timelineTime:    { fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.2rem" },
  timelineAction:  { display: "block", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "0.25rem" },
  timelineChanges: { fontSize: "0.85rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.015)", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border-subtle)", marginBottom: "0.4rem" },
  timelineUser:    { fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }
};

export default AgentComplaints;
