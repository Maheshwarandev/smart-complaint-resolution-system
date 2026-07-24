import { useEffect, useState } from "react";
import { getAllUsersAPI, updateUserRoleAPI, deleteUserAPI } from "../../api/adminAPI";
import { ROLES } from "../../constants";
import Spinner from "../../components/common/Spinner";
import ConfirmModal from "../../components/common/ConfirmModal";

const ManageUsers = () => {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [toast,       setToast]       = useState("");
  const [confirm,     setConfirm]     = useState({ open: false, id: null });
  const [roleConfirm, setRoleConfirm] = useState({ open: false, id: null, role: null });

  const load = async () => {
    try {
      const res = await getAllUsersAPI();
      setUsers(res.data.users);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRoleAPI(id, { role });
      if (role === ROLES.USER) {
        setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      } else {
        setUsers(prev => prev.filter(u => u._id !== id));
        setToast(`User promoted to "${role}" and moved out of this list.`);
        setTimeout(() => setToast(""), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Role update failed.");
    } finally {
      setRoleConfirm({ open: false, id: null, role: null });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserAPI(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setToast("User account deleted.");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const requestDelete = (id) => setConfirm({ open: true, id });
  const cancelDelete = () => setConfirm({ open: false, id: null });
  const requestRoleChange = (id, role) => setRoleConfirm({ open: true, id, role });
  const cancelRoleChange = () => setRoleConfirm({ open: false, id: null, role: null });

  const filtered = users.filter(u => 
    search.trim() === "" ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div style={s.page} className="animate-fade-in">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>👥 User Directory</h1>
          <p style={s.sub}>{users.length} registered regular users in system</p>
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="🔍 Search users by name, email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={s.searchInput}
        />
      </div>

      <div className="glass-panel" style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["User", "Email", "Role Level", "Complaints", "Joined Date", "Actions"].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={s.emptyTd}>No users found.</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u._id} style={s.tr}>
                  <td style={s.td}>
                    <div style={s.userCell}>
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} style={s.avatarImg} />
                      ) : (
                        <div style={s.avatarFallback}>{u.name?.[0]?.toUpperCase() || "U"}</div>
                      )}
                      <div>
                        <strong style={s.nameText}>{u.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <select
                      value={u.role}
                      onChange={(e) => requestRoleChange(u._id, e.target.value)}
                      style={s.roleSelect}
                    >
                      <option value="user" style={s.option}>User</option>
                      <option value="agent" style={s.option}>Agent</option>
                      <option value="admin" style={s.option}>Admin</option>
                    </select>
                  </td>
                  <td style={{ ...s.td, textAlign: "center" }}>
                    <span style={s.countBadge}>{u.complaintCount ?? 0}</span>
                  </td>
                  <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <button style={s.deleteBtn} onClick={() => requestDelete(u._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirm.open}
        message={"Delete this user and ALL their submitted complaints?"}
        onConfirm={() => handleDelete(confirm.id)}
        onCancel={cancelDelete}
      />

      <ConfirmModal
        open={roleConfirm.open}
        message={`Change role of this account to "${roleConfirm.role}"?`}
        onConfirm={() => handleRoleChange(roleConfirm.id, roleConfirm.role)}
        onCancel={cancelRoleChange}
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
  avatarFallback: { width: "36px", height: "36px", borderRadius: "50%", background: "var(--grad-primary)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.88rem" },
  nameText: { color: "var(--text-primary)", fontSize: "0.95rem" },
  roleSelect: { background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "0.35rem 0.65rem", color: "var(--accent-blue)", fontWeight: "700", fontSize: "0.82rem", outline: "none", cursor: "pointer" },
  option: { background: "#0d1320", color: "#ffffff" },
  countBadge: { background: "rgba(255, 255, 255, 0.05)", padding: "0.2rem 0.6rem", borderRadius: "10px", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-primary)" },
  deleteBtn: { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.25)", padding: "0.4rem 0.85rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "700" }
};

export default ManageUsers;
