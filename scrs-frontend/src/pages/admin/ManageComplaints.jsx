import { useEffect, useState } from "react";
import { getAllComplaintsAPI, updateComplaintAPI, addCommentAPI } from "../../api/complaintAPI";
import { getAllAgentsAPI, assignComplaintAPI } from "../../api/adminAPI";
import Spinner from "../../components/common/Spinner";
import ActivityTimeline from "../../components/common/ActivityTimeline";
import AttachmentList from "../../components/common/AttachmentList";
import CommentThread from "../../components/common/CommentThread";
import StarRating from "../../components/common/StarRating";
import { exportComplaintsToCSV } from "../../utils/csvExporter";

const STATUS_COLORS = {
  Open:          { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
  "In Progress": { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
  Resolved:      { bg: "rgba(34, 197, 94, 0.15)", color: "#34d399" },
  Closed:        { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" },
};

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [agents,     setAgents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("All");
  const [search,     setSearch]     = useState("");
  const [error,      setError]      = useState("");

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          getAllComplaintsAPI(),
          getAllAgentsAPI(),
        ]);
        setComplaints(cRes.data.complaints);
        setAgents(aRes.data.agents);
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateComplaintAPI(id, { status });
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed.");
    }
  };

  const handleAssign = async (complaintId, agentId) => {
    if (!agentId) return;
    try {
      const res = await assignComplaintAPI(complaintId, { agentId });
      const updated = res.data.complaint;
      setComplaints(prev => prev.map(c => c._id === complaintId ? updated : c));
    } catch (err) {
      alert(err.response?.data?.message || "Assignment failed.");
    }
  };

  const handleAddComment = async (complaintId, text) => {
    const res = await addCommentAPI(complaintId, text);
    setComplaints(prev => prev.map(c => c._id === complaintId ? res.data.data : c));
  };

  const filtered = complaints.filter(c => {
    const matchesStatus = filter === "All" || c.status === filter;
    const matchesSearch = search.trim() === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      (c.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.assignedTo?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <Spinner />;

  const s = styles;
  return (
    <div style={s.page} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h1 style={s.title}>Manage Complaints</h1>
        <button 
          onClick={() => exportComplaintsToCSV(filtered, "All_System_Complaints.csv")}
          style={{
            background: "rgba(56, 189, 248, 0.12)", color: "var(--accent-blue)",
            border: "1px solid rgba(56, 189, 248, 0.25)", padding: "0.5rem 1.1rem",
            borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "0.88rem"
          }}
        >
          📥 Export CSV
        </button>
      </div>
      <p style={s.sub}>{complaints.length} total complaints</p>

      {error && <div style={s.error}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="🔍 Search all complaints by title, category, complainant, or assigned agent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--border-subtle)",
            borderRadius: "10px", padding: "0.75rem 1rem", color: "var(--text-primary)",
            fontSize: "0.92rem", width: "100%", boxSizing: "border-box", outline: "none"
          }}
        />
        {/* Filter tabs */}
        <div style={s.tabs}>
          {["All", "Open", "In Progress", "Resolved", "Closed"].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              style={{ ...s.tab, ...(filter === tab ? s.activeTab : {}) }}
              className={filter !== tab ? "hover-lift" : ""}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={s.list}>
        {filtered.map((c) => {
          const sc = STATUS_COLORS[c.status] || {};
          const isExpanded = expandedId === c._id;
          return (
            <div key={c._id} style={s.card} className="glass-panel">
              {/* Top row */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : c._id)}
                style={{ ...s.cardTop, cursor: "pointer" }}
              >
                <div>
                  <h3 style={s.cardTitle}>{c.title}</h3>
                  <p style={s.meta}>
                    👤 {c.user?.name} · 📁 {c.category} · ⚡ {c.priority} · 🗓 {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span style={{ ...s.badge, background: sc.bg, color: sc.color }}>
                    {c.status}
                  </span>
                  <span style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </div>
              </div>

              {!isExpanded && (
                <p style={s.desc}>{(c.description?.slice(0, 120) ?? '') + (c.description?.length > 120 ? '...' : '')}</p>
              )}

              {c.rating?.score && !isExpanded && (
                <StarRating rating={c.rating} readonly={true} />
              )}

              {c.resolutionNote && !isExpanded && (
                <div style={s.note}>💬 Resolution: {c.resolutionNote}</div>
              )}

              {/* Expanded Area */}
              {isExpanded && (
                <div style={s.expandedContent}>
                  <div style={s.section}>
                    <p style={s.controlLabel}>Description</p>
                    <p style={s.fullDesc}>{c.description}</p>
                  </div>

                  {c.resolutionNote && (
                    <div style={s.section}>
                      <p style={s.controlLabel}>Resolution Note</p>
                      <p style={s.fullDesc}>{c.resolutionNote}</p>
                    </div>
                  )}

                  {c.rating?.score && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={s.controlLabel}>User Feedback & Rating</p>
                      <StarRating rating={c.rating} readonly={true} />
                    </div>
                  )}

                  <AttachmentList attachments={c.attachments} />

                  <CommentThread 
                    comments={c.comments} 
                    onAddComment={(text) => handleAddComment(c._id, text)} 
                  />

                  <ActivityTimeline history={c.history} />

                  {/* Controls row */}
                  <div style={s.controls}>
                    {/* Status changer */}
                    <div style={s.controlGroup}>
                      <label style={s.controlLabel}>Change Status</label>
                      <select className="input-field" style={s.select} value={c.status}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}>
                        {["Open", "In Progress", "Resolved", "Closed"].map(st =>
                          <option key={st} value={st} style={s.option}>{st}</option>
                        )}
                      </select>
                    </div>

                    {/* Agent assignment */}
                    <div style={s.controlGroup}>
                      <label style={s.controlLabel}>Assign to Agent</label>
                      <select className="input-field" style={s.select}
                        value={c.assignedTo?._id || c.assignedTo || ""}
                        onChange={(e) => handleAssign(c._id, e.target.value)}>
                        <option value="" style={s.option}>-- Unassigned --</option>
                        {agents.map(a =>
                          <option key={a._id} value={a._id} style={s.option}>{a.name}</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={s.empty} className="glass-panel">No complaints found for "{filter}".</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page:         { padding: "2rem", maxWidth: "1000px", margin: "0 auto" },
  title:        { margin: "0 0 0.25rem", color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  sub:          { margin: "0 0 1.5rem", color: "var(--text-secondary)" },
  error:        { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  tabs:         { display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  tab:          { padding: "0.45rem 1.1rem", border: "1px solid var(--border-subtle)", borderRadius: "20px", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: "0.88rem", color: "var(--text-secondary)", fontFamily: "var(--font-heading)", fontWeight: "600", transition: "all 0.2s" },
  activeTab:    { background: "var(--grad-primary)", color: "#fff", border: "1px solid transparent", boxShadow: "0 4px 10px rgba(14,165,233,0.15)" },
  list:         { display: "flex", flexDirection: "column", gap: "1.25rem" },
  card:         { padding: "1.25rem 1.5rem", borderRadius: "16px" },
  cardTop:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" },
  cardTitle:    { margin: 0, color: "var(--text-primary)", fontSize: "1.15rem", fontWeight: "800" },
  meta:         { margin: "0.3rem 0 0", color: "var(--text-muted)", fontSize: "0.82rem" },
  badge:        { padding: "0.2rem 0.65rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700", whiteSpace: "nowrap" },
  desc:         { color: "var(--text-secondary)", fontSize: "0.92rem", margin: "0.5rem 0 1rem" },
  note:         { background: "rgba(52, 211, 153, 0.08)", color: "#34d399", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.88rem", marginBottom: "0.75rem", border: "1px solid rgba(52, 211, 153, 0.2)" },
  controls:     { display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" },
  controlGroup: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  controlLabel: { fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" },
  select:       { cursor: "pointer", width: "auto" },
  option:       { background: "var(--bg-sidebar)", color: "var(--text-primary)" },
  empty:        { textAlign: "center", padding: "3rem", color: "var(--text-secondary)" },

  expandedContent: { marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" },
  section:         { marginBottom: "1.5rem" },
  fullDesc:        { margin: "0.5rem 0", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.5", background: "rgba(255,255,255,0.015)", padding: "0.8rem 1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" },
  
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

export default ManageComplaints;
