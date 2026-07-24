import { useEffect, useState } from "react";
import { getAllAgentsAPI, updateUserRoleAPI, generateAgentSecurityCodeAPI } from "../../api/adminAPI";
import Spinner from "../../components/common/Spinner";
import ConfirmModal from "../../components/common/ConfirmModal";

const ManageAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [generatedCode, setGeneratedCode] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const load = async () => {
    try {
      const res = await getAllAgentsAPI();
      setAgents(res.data.agents);
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
      setAgents(prev => prev.filter(u => u._id !== id));
      setToast("Agent demoted to regular user role.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Demotion failed.");
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const requestDemote = (id) => setConfirm({ open: true, id });
  const cancelDemote = () => setConfirm({ open: false, id: null });

  const filtered = agents.filter(a => 
    search.trim() === "" ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div style={s.page} className="animate-fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🛠️ Support Engineers Directory</h1>
          <p style={s.sub}>{agents.length} active support agents handling complaints</p>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="🔍 Search support agents by name, email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={s.searchInput}
        />
      </div>

      <div className="glass-panel" style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Agent Engineer", "Email", "Assigned Active", "Security Passkey", "Actions"].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={s.emptyTd}>No agents found. Promote a regular user from the User Directory first!</td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a._id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.userCell}>
                      {a.avatar ? (
                        <img src={a.avatar} alt={a.name} style={s.avatarImg} />
                      ) : (
                        <div style={s.avatarFallback}>{a.name?.[0]?.toUpperCase() || "A"}</div>
                      )}
                      <div>
                        <strong style={s.nameText}>{a.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>{a.email}</td>
                  <td style={{ ...s.td, textAlign: "center" }}>
                    <span style={s.countBadge}>{a.assignedCount ?? 0} ticket(s)</span>
                  </td>
                  <td style={s.td}>
                    <button style={s.codeBtn} onClick={() => handleGenerateCode(a._id)}>
                      🔑 Generate Passkey
                    </button>
                  </td>
                  <td style={s.td}>
                    <button style={s.demoteBtn} onClick={() => requestDemote(a._id)}>
                      Demote to User
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Security Code Modal */}
      {showCodeModal && generatedCode && (
        <div style={s.modalOverlay}>
          <div style={s.modalCard} className="glass-panel animate-slide-up">
            <h3 style={s.modalTitle}>🔐 Agent Security Code Generated</h3>
            <p style={s.modalSub}>Provide this security code to the agent so they can sign in to the Agent Portal:</p>
            <div style={s.codeBox}>
              {generatedCode.securityCode || generatedCode.code}
            </div>
            <button onClick={() => setShowCodeModal(false)} style={s.closeModalBtn}>
              Close Window
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        message={"Demote this agent back to regular user role?"}
        onConfirm={() => handleDemoteToUser(confirm.id)}
        onCancel={cancelDemote}
      />
    </div>
  );
};

const s = {
  page: { padding: "2rem", maxWidth: "1100px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  title: { margin: 0, color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800", fontFamily: "var(--font-heading)" },
  sub: { margin: "0.25rem 0 0", color: "var(--text-secondary)", fontSize: "0.88rem" },
  error: { background: "rgba(244, 63, 94, 0.12)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.25)", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.88rem" },
  toast: { background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem", fontSize: "0.88rem" },
  searchInput: { background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "0.75rem 1rem", color: "var(--text-primary)", fontSize: "0.92rem", width: "100%", boxSizing: "border-box", outline: "none" },
  tableWrap: { borderRadius: "16px", overflowX: "auto", border: "1px solid var(--border-subtle)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" },
  th: { padding: "1rem 1.25rem", background: "rgba(255, 255, 255, 0.02)", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-subtle)" },
  tr: { borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" },
  td: { padding: "1rem 1.25rem", color: "var(--text-primary)", verticalAlign: "middle" },
  emptyTd: { padding: "3rem", textAlign: "center", color: "var(--text-secondary)" },
  userCell: { display: "flex", alignItems: "center", gap: "0.75rem" },
  avatarImg: { width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--accent-blue)" },
  avatarFallback: { width: "36px", height: "36px", borderRadius: "50%", background: "var(--grad-accent)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.88rem" },
  nameText: { color: "var(--text-primary)", fontSize: "0.95rem" },
  countBadge: { background: "rgba(56, 189, 248, 0.1)", color: "var(--accent-blue)", padding: "0.2rem 0.65rem", borderRadius: "10px", fontSize: "0.82rem", fontWeight: "700" },
  codeBtn: { background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.25)", padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "700" },
  demoteBtn: { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.25)", padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "700" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" },
  modalCard: { width: "100%", maxWidth: "400px", padding: "2rem", borderRadius: "16px", textAlign: "center", background: "#0d1320", border: "1px solid var(--border-glow)" },
  modalTitle: { margin: "0 0 0.5rem", color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: "800" },
  modalSub: { color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.25rem" },
  codeBox: { background: "rgba(56, 189, 248, 0.15)", color: "var(--accent-blue)", border: "2px dashed var(--accent-blue)", padding: "1rem", borderRadius: "12px", fontSize: "1.5rem", fontWeight: "800", letterSpacing: "0.1em", marginBottom: "1.5rem" },
  closeModalBtn: { background: "var(--grad-primary)", color: "#ffffff", border: "none", padding: "0.65rem 1.5rem", borderRadius: "8px", fontWeight: "700", fontSize: "0.88rem", cursor: "pointer" }
};

export default ManageAgents;
