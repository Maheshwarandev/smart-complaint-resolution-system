import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllComplaintsAPI, deleteComplaintAPI } from "../../api/complaintAPI";
import Spinner from "../../components/common/Spinner";
import ConfirmModal from "../../components/common/ConfirmModal";
import ActivityTimeline from "../../components/common/ActivityTimeline";
import AttachmentList from "../../components/common/AttachmentList";

const STATUS_COLORS = {
  Open:          { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
  "In Progress": { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" },
  Resolved:      { bg: "rgba(34, 197, 94, 0.15)", color: "#34d399" },
  Closed:        { bg: "rgba(148, 163, 184, 0.15)", color: "#94a3b8" },
};
const PRIORITY_COLORS = {
  High:   { color: "#dc2626" },
  Medium: { color: "#d97706" },
  Low:    { color: "#16a34a" },
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [filter,     setFilter]     = useState("All");
  const [toast,      setToast]      = useState("");
  const [confirm,    setConfirm]    = useState({ open: false, id: null });
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllComplaintsAPI();
      setComplaints(res.data.complaints);
    } catch {
      setError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteComplaintAPI(id);
      setComplaints(prev => prev.filter(c => c._id !== id));
      setToast("Complaint deleted.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
    finally {
      setConfirm({ open: false, id: null });
    }
  };

  const requestDelete = (id) => setConfirm({ open: true, id });
  const cancelDelete = () => setConfirm({ open: false, id: null });

  const filtered = filter === "All"
    ? complaints
    : complaints.filter(c => c.status === filter);

  if (loading) return <Spinner />;

  const s = styles;
  return (
    <div style={s.page} className="animate-fade-in">
      {toast && <div style={s.toast}>{toast}</div>}
      <div style={s.header}>
        <h1 style={s.title}>My Complaints</h1>
      </div>

      {error && <div style={s.error}>{error}</div>}

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

      {filtered.length === 0 ? (
        <div style={s.empty} className="glass-panel">No complaints found for "{filter}".</div>
      ) : (
        <div style={s.list}>
          {filtered.map((c) => {
            const sc = STATUS_COLORS[c.status]   || {};
            const pc = PRIORITY_COLORS[c.priority] || {};
            const isExpanded = expandedId === c._id;
            return (
              <div key={c._id} style={s.card} className="glass-panel hover-lift">
                <div style={s.cardTop}>
                  <h3 style={s.cardTitle}>{c.title}</h3>
                  <span style={{ ...s.badge, background: sc.bg, color: sc.color }}>
                    {c.status}
                  </span>
                </div>
                
                {!isExpanded && (
                  <p style={s.desc}>{(c.description?.slice(0, 120) ?? '') + (c.description?.length > 120 ? '...' : '')}</p>
                )}

                <div style={s.meta}>
                  <span>📁 {c.category}</span>
                  <span style={{ color: pc.color, fontWeight: 600 }}>⚡ {c.priority}</span>
                  <span>🗓 {new Date(c.createdAt).toLocaleDateString()}</span>
                  {c.assignedTo && <span>👤 {c.assignedTo.name}</span>}
                </div>
                
                {c.resolutionNote && !isExpanded && (
                  <div style={s.note}>💬 {c.resolutionNote}</div>
                )}

                <div style={{ marginTop: "1.25rem", display: "flex", gap: "1rem" }}>
                  <button 
                    style={s.toggleBtn} 
                    onClick={() => setExpandedId(isExpanded ? null : c._id)}
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>

                  {/* Only show delete for Open complaints */}
                  {c.status === "Open" && (
                    <button style={s.deleteBtn} onClick={() => requestDelete(c._id)}>
                      Delete
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div style={s.expandedContent}>
                    <p style={s.desc}><strong>Full Description:</strong><br/>{c.description}</p>
                    
                    {c.resolutionNote && (
                      <div style={s.note}><strong>Resolution Note:</strong><br/>{c.resolutionNote}</div>
                    )}

                    <AttachmentList attachments={c.attachments} />

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
        message={"Delete this complaint?"}
        onConfirm={() => handleDelete(confirm.id)}
        onCancel={cancelDelete}
      />
    </div>
  );
};

const styles = {
  page:      { padding: "2rem", maxWidth: "900px", margin: "0 auto" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title:     { margin: 0, color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  error:     { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  toast:     { background: "rgba(52, 211, 153, 0.1)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  tabs:      { display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  tab:       { padding: "0.45rem 1.1rem", border: "1px solid var(--border-subtle)", borderRadius: "20px", background: "rgba(255,255,255,0.02)", cursor: "pointer", fontSize: "0.88rem", color: "var(--text-secondary)", fontFamily: "var(--font-heading)", fontWeight: "600", transition: "all 0.2s" },
  activeTab: { background: "var(--grad-primary)", color: "#fff", border: "1px solid transparent", boxShadow: "0 4px 10px rgba(14,165,233,0.15)" },
  empty:     { textAlign: "center", padding: "3rem", color: "var(--text-secondary)" },
  list:      { display: "flex", flexDirection: "column", gap: "1rem" },
  card:      { padding: "1.25rem 1.5rem" },
  cardTop:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" },
  cardTitle: { margin: 0, color: "var(--text-primary)", fontSize: "1.15rem", fontWeight: "800" },
  badge:     { padding: "0.2rem 0.65rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700", whiteSpace: "nowrap" },
  desc:      { color: "var(--text-secondary)", fontSize: "0.92rem", margin: "0.5rem 0", lineHeight: "1.5" },
  meta:      { display: "flex", gap: "1.2rem", fontSize: "0.82rem", color: "var(--text-muted)", flexWrap: "wrap", marginTop: "0.5rem" },
  note:      { marginTop: "1rem", background: "rgba(52, 211, 153, 0.08)", color: "#34d399", padding: "0.75rem", borderRadius: "8px", fontSize: "0.88rem", border: "1px solid rgba(52, 211, 153, 0.2)" },
  toggleBtn: { padding: "0.45rem 1rem", background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s" },
  deleteBtn: { padding: "0.45rem 1rem", background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s" },
  
  expandedContent: { marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" },
  section:         { marginTop: "1.5rem" },
  sectionTitle:    { margin: "0 0 1rem", color: "var(--text-primary)", fontSize: "1rem", fontWeight: "700" },
  
  attachmentList:  { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  attachmentBtn:   { background: "rgba(56, 189, 248, 0.1)", color: "var(--accent-blue)", padding: "0.4rem 0.8rem", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: "500", border: "1px solid rgba(56, 189, 248, 0.2)" },
  
  timeline:        { display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "2px solid var(--border-subtle)", paddingLeft: "1.2rem", marginLeft: "0.5rem" },
  timelineItem:    { position: "relative" },
  timelineDot:     { position: "absolute", left: "-1.55rem", top: "0.3rem", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-blue)", border: "2px solid var(--bg-app)" },
  timelineContent: { background: "rgba(255,255,255,0.01)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" },
  timelineTime:    { fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.2rem" },
  timelineAction:  { display: "block", color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "0.25rem" },
  timelineChanges: { fontSize: "0.85rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.015)", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border-subtle)", marginBottom: "0.4rem" },
  timelineUser:    { fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }
};

export default MyComplaints;
