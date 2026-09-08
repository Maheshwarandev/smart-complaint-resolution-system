import React, { useEffect, useState } from "react";
import { getAllAgentsAPI, updateUserRoleAPI, generateAgentSecurityCodeAPI } from "../../api";
import { Spinner, ConfirmModal } from "../../components";

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
      setAgents(res.data.agents || []);
    } catch {
      setError("Failed to load support agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      setAgents((prev) => prev.filter((u) => u._id !== id));
      setToast("Agent demoted to standard user role.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Demotion failed.");
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const filtered = agents.filter(
    (a) =>
      search.trim() === "" ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 style={styles.title}>Support Agents</h1>
          <p style={styles.subtitle}>
            {agents.length} active agents resolving complaints across queues
          </p>
        </div>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      {/* Search Bar */}
      <div style={styles.searchWrap}>
        <i className="ti ti-search" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search support agents by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Agent Table */}
      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Agent</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>CSAT Rating</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.avatar}>
                        {a.name?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{a.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Agent ID: #{a._id.slice(-4).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ ...styles.td, color: "var(--text-secondary)" }}>{a.email}</td>

                  <td style={styles.td}>
                    <span className="badge-status badge-progress">
                      <span className="badge-dot" />
                      <span>Active</span>
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={{ color: "#E3A008", fontWeight: 600, fontSize: "13px" }}>
                      ★ {a.rating?.score || "5.0"}
                    </span>
                  </td>

                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleGenerateCode(a._id)}
                        className="btn-ghost"
                        style={{ height: "28px", fontSize: "12px", padding: "0 10px" }}
                      >
                        <i className="ti ti-key" /> Passkey
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirm({ open: true, id: a._id })}
                        className="btn-danger"
                        style={{ height: "28px", fontSize: "12px", padding: "0 10px" }}
                      >
                        Demote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Code Modal */}
      {showCodeModal && generatedCode && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="ti ti-shield-lock" style={{ fontSize: "20px", color: "var(--brand)" }} />
                <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)" }}>
                  Agent Security Passkey
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "14px 0" }}>
              Provide this security passkey to the agent so they can authenticate to their portal:
            </p>

            <div style={styles.codeBox}>
              <code style={styles.codeText}>{generatedCode.securityCode}</code>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowCodeModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        message="Are you sure you want to demote this agent to a regular user?"
        onConfirm={() => handleDemoteToUser(confirm.id)}
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "13px",
  },
  th: {
    padding: "10px 16px",
    background: "var(--bg-surface)",
    color: "var(--text-muted)",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    borderBottom: "1px solid var(--border)",
  },
  tr: {
    borderBottom: "1px solid var(--border)",
  },
  td: {
    padding: "12px 16px",
    verticalAlign: "middle",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "var(--brand-subtle)",
    color: "var(--brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid var(--brand-muted)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalContent: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    width: "100%",
    maxWidth: "420px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "16px",
    cursor: "pointer",
  },
  codeBox: {
    background: "var(--bg-base)",
    border: "1px solid var(--border)",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    textAlign: "center",
  },
  codeText: {
    fontFamily: "var(--font-mono)",
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--brand)",
    letterSpacing: "0.15em",
  },
};

export default ManageAgents;
