import { useEffect, useState } from "react";
import { getAllAgentsAPI, updateUserRoleAPI } from "../../api/adminAPI";
import { generateAgentSecurityCodeAPI } from "../../api/adminAPI";
import Spinner from "../../components/common/Spinner";
import ConfirmModal from "../../components/common/ConfirmModal";

const ManageAgents = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const load = async () => {
    try {
      const res = await getAllAgentsAPI();
      setUsers(res.data.agents);
    } catch {
      setError("Failed to load agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerateCode = async (agentId) => {
    try {
      const res = await generateAgentSecurityCodeAPI(agentId);
      setGeneratedCode(res.data);
      setShowCodeModal(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate security code.");
    }
  };

  const handleDemoteToUser = async (id) => {
    try {
      await updateUserRoleAPI(id, { role: "user" });
      setUsers(prev => prev.filter(u => u._id !== id));
      setToast("Agent demoted to user role.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Demotion failed.");
    }
    finally {
      setConfirm({ open: false, id: null });
    }
  };

  const requestDemote = (id) => setConfirm({ open: true, id });
  const cancelDemote = () => setConfirm({ open: false, id: null });

  if (loading) return <Spinner />;

  const s = styles;
  return (
    <div style={s.page} className="animate-fade-in">
      <h1 style={s.title}>Manage Agents</h1>
      <p style={s.sub}>{users.length} active agents</p>

      {toast && <div style={s.toast}>{toast}</div>}

      {error && <div style={s.error}>{error}</div>}

      {users.length === 0 ? (
        <div style={s.empty} className="glass-panel">No agents found. Promote users to agents in <strong>Manage Users</strong>.</div>
      ) : (
        <div className="glass-panel" style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>{["Name", "Email", "Complaints Assigned", "Joined", "Actions"].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {users.map((u) => (
              <tr key={u._id} style={s.tr}>
                  <td style={s.td}><strong>{u.name}</strong></td>
                  <td style={s.td}>{u.email}</td>
                  <td style={{ ...s.td, textAlign: "center" }}>{u.complaintCount ?? '—'}</td>
                  <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <div style={s.actionGroup}>
                      <button 
                        style={s.codeBtn} 
                        onClick={() => handleGenerateCode(u._id)}
                      >
                        🔐 New Code
                      </button>
                      <button 
                        style={s.demoteBtn} 
                        onClick={() => requestDemote(u._id)}
                      >
                        ↓ Demote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for displaying generated security code */}
      {showCodeModal && generatedCode && (
        <div style={s.modalOverlay} onClick={() => setShowCodeModal(false)}>
          <div className="glass-panel" style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 0.5rem", color: "var(--text-primary)" }}>Security Code Generated ✅</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Share this code with <strong>{generatedCode.agentName}</strong> ({generatedCode.agentEmail})
            </p>
            <div style={s.codeBox}>
              <code style={{ fontSize: "1.4rem", letterSpacing: "4px", fontWeight: "700" }}>
                {generatedCode.securityCode}
              </code>
            </div>
            <p style={{ color: "#f43f5e", fontSize: "0.85rem", marginTop: "1.5rem", fontWeight: "600" }}>
              ⚠️ This code is shown only once. Write it down or share it securely. They'll use it to log in to the agent dashboard.
            </p>
            <button 
              className="btn-primary"
              style={s.closeBtn} 
              onClick={() => setShowCodeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirm.open}
        message={"Demote this agent to a regular user?"}
        onConfirm={() => handleDemoteToUser(confirm.id)}
        onCancel={cancelDemote}
      />
    </div>
  );
};

const styles = {
  page:         { padding: "2rem", maxWidth: "1000px", margin: "0 auto" },
  title:        { margin: "0 0 0.25rem", color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  sub:          { margin: "0 0 1.5rem", color: "var(--text-secondary)" },
  error:        { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  toast:        { background: "rgba(52, 211, 153, 0.1)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  empty:        { padding: "3rem", color: "var(--text-secondary)", textAlign: "center" },
  tableWrap:    { overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "12px", boxShadow: "none" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { textAlign: "left", padding: "0.9rem 1.2rem", background: "rgba(255,255,255,0.01)", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "700", borderBottom: "1px solid var(--border-subtle)" },
  tr:           { borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" },
  td:           { padding: "0.9rem 1.2rem", fontSize: "0.9rem", color: "var(--text-secondary)" },
  actionGroup:  { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  codeBtn:      { padding: "0.4rem 0.8rem", background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", whiteSpace: "nowrap", transition: "all 0.2s" },
  demoteBtn:    { padding: "0.4rem 0.8rem", background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", whiteSpace: "nowrap", transition: "all 0.2s" },
  
  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" },
  modal:        { padding: "2.5rem 2rem", maxWidth: "420px", width: "90%", display: "flex", flexDirection: "column", alignItems: "center" },
  codeBox:      { width: "100%", background: "rgba(255, 255, 255, 0.02)", padding: "1.25rem", borderRadius: "10px", border: "2px dashed var(--border-subtle)", color: "var(--accent-blue)", boxSizing: "border-box" },
  closeBtn:     { marginTop: "1.5rem", padding: "0.6rem 2rem" },
};

export default ManageAgents;
