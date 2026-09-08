import React, { useEffect, useState } from "react";
import { getAllUsersAPI, updateUserRoleAPI, deleteUserAPI } from "../../api";
import { Spinner } from "../../components";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await getAllUsersAPI();
      setUsers(res.data.users || []);
    } catch {
      setError("Failed to load users directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleAPI(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setToast(`User role updated to "${newRole}"`);
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user role.");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUserAPI(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setToast("User deleted successfully.");
      setTimeout(() => setToast(""), 3000);
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert("No users to export.");
      return;
    }
    const headers = "Name,Email,Role,Joined Date\n";
    const rows = filtered
      .map(
        (u) =>
          `"${u.name || ""}","${u.email || ""}","${u.role || ""}","${new Date(u.createdAt).toLocaleDateString()}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "System_Users_Directory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast("Users list exported to CSV!");
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "All" || u.role === roleFilter.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getAvatarBg = (role) => {
    if (role === "admin") return "rgba(14, 159, 110, 0.2)";
    if (role === "agent") return "var(--brand-subtle)";
    return "var(--bg-hover)";
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
          <h1 style={styles.title}>Users Directory</h1>
          <p style={styles.subtitle}>{users.length} users registered in the system</p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-ghost"
          style={{ height: "36px" }}
        >
          <i className="ti ti-download" /> Export Users CSV
        </button>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      {/* Search & Role Filter Tabs */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <i className="ti ti-search" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterTabs}>
          {["All", "User", "Agent", "Admin"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              style={{
                ...styles.filterTab,
                background: roleFilter === tab ? "var(--brand)" : "transparent",
                color: roleFilter === tab ? "#FFFFFF" : "var(--text-secondary)",
                borderColor: roleFilter === tab ? "var(--brand)" : "var(--border)",
              }}
            >
              {tab}s
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="panel" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined Date</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyTd}>
                    No users match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isConfirming = confirmDeleteId === u._id;

                  return (
                    <React.Fragment key={u._id}>
                      <tr style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div
                              style={{
                                ...styles.avatar,
                                background: getAvatarBg(u.role),
                                color: u.role === "admin" ? "var(--resolved)" : "var(--text-primary)",
                              }}
                            >
                              {u.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{u.name}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                ID: #{u._id.slice(-4).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ ...styles.td, color: "var(--text-secondary)" }}>{u.email}</td>

                        <td style={styles.td}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            style={styles.roleSelect}
                          >
                            <option value="user">User</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td style={{ ...styles.td, color: "var(--text-muted)", fontSize: "12px" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(isConfirming ? null : u._id)}
                            className="btn-danger"
                            style={{ height: "28px", fontSize: "12px", padding: "0 10px" }}
                          >
                            <i className="ti ti-trash" /> Delete
                          </button>
                        </td>
                      </tr>

                      {/* Inline Confirmation Card */}
                      {isConfirming && (
                        <tr>
                          <td colSpan="5" style={styles.confirmTd}>
                            <div style={styles.confirmBox}>
                              <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                                Delete <strong>{u.name}</strong>? This action will permanently remove their profile.
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="btn-ghost"
                                  style={{ height: "28px", fontSize: "12px", padding: "0 10px" }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(u._id)}
                                  className="btn-danger"
                                  style={{ height: "28px", fontSize: "12px", padding: "0 12px" }}
                                >
                                  Confirm Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
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
  emptyTd: {
    padding: "24px 16px",
    textAlign: "center",
    color: "var(--text-muted)",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
    border: "1px solid var(--border)",
  },
  roleSelect: {
    height: "30px",
    fontSize: "12px",
    width: "100px",
    padding: "0 8px",
  },
  confirmTd: {
    padding: "8px 16px",
    background: "var(--urgent-bg)",
    borderBottom: "1px solid rgba(224, 36, 36, 0.3)",
  },
  confirmBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
};

export default ManageUsers;
