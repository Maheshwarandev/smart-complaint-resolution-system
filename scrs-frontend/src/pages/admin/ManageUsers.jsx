import { useEffect, useState } from "react";
import { getAllUsersAPI, updateUserRoleAPI, deleteUserAPI } from "../../api/adminAPI";
import { ROLES } from "../../constants";
import Spinner from "../../components/common/Spinner";
import ConfirmModal from "../../components/common/ConfirmModal";

const ManageUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [toast,   setToast]   = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });
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
        // Still a regular user — just update in-place
        setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      } else {
        // Promoted to agent/admin — remove from this list (backend only returns role='user')
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
      setToast("User deleted.");
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

  if (loading) return <Spinner />;

  const s = styles;
  return (
    <div style={s.page} className="animate-fade-in">
      <h1 style={s.title}>Manage Users</h1>
      <p style={s.sub}>{users.length} registered users</p>

      {error && <div style={s.error}>{error}</div>}
      {toast && <div style={s.toast}>{toast}</div>}

      <div className="glass-panel" style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{["Name", "Email", "Role", "Complaints", "Joined", "Actions"].map(h =>
              <th key={h} style={s.th}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={s.tr}>
                <td style={s.td}><strong>{u.name}</strong></td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}>
                  <select
                    value={u.role}
                    onChange={(e) => requestRoleChange(u._id, e.target.value)}
                    className="input-field"
                    style={{ 
                      ...s.select, 
                      color: u.role === "admin" ? "#f43f5e" : u.role === "agent" ? "#38bdf8" : "var(--text-secondary)" 
                    }}
                  >
                    <option value="user" style={s.option}>user</option>
                    <option value="agent" style={s.option}>agent</option>
                    <option value="admin" style={s.option}>admin</option>
                  </select>
                </td>
                <td style={{ ...s.td, textAlign: "center" }}>{u.complaintCount ?? '—'}</td>
                <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={s.td}>
                  <button style={s.deleteBtn} onClick={() => requestDelete(u._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={confirm.open}
        message={"Delete this user and ALL their complaints?"}
        onConfirm={() => handleDelete(confirm.id)}
        onCancel={cancelDelete}
      />
      <ConfirmModal
        open={roleConfirm.open}
        message={roleConfirm.open ? `Change role to "${roleConfirm.role}"?` : ""}
        onConfirm={() => handleRoleChange(roleConfirm.id, roleConfirm.role)}
        onCancel={cancelRoleChange}
      />
    </div>
  );
};

const styles = {
  page:      { padding: "2rem", maxWidth: "1000px", margin: "0 auto" },
  title:     { margin: "0 0 0.25rem", color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  sub:       { margin: "0 0 1.5rem", color: "var(--text-secondary)" },
  error:     { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  toast:     { background: "rgba(52, 211, 153, 0.1)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  tableWrap: { overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "12px", boxShadow: "none" },
  table:     { width: "100%", borderCollapse: "collapse" },
  th:        { textAlign: "left", padding: "0.9rem 1.2rem", background: "rgba(255,255,255,0.01)", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "700", borderBottom: "1px solid var(--border-subtle)" },
  tr:        { borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" },
  td:        { padding: "0.9rem 1.2rem", fontSize: "0.9rem", color: "var(--text-secondary)" },
  select:    { padding: "0.3rem 0.5rem", width: "auto", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" },
  option:    { background: "var(--bg-sidebar)", color: "var(--text-primary)" },
  deleteBtn: { padding: "0.4rem 0.8rem", background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", transition: "all 0.2s" },
};

export default ManageUsers;
