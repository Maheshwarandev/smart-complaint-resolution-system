import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context";
import { ROLES } from "../constants";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
      <div>
        {/* Navigation Group */}
        <div className="nav-section">NAVIGATION</div>

        {user.role === ROLES.USER && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={onClose}
            >
              <i className="ti ti-layout-dashboard" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/complaints"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={onClose}
            >
              <i className="ti ti-ticket" />
              <span>My Complaints</span>
            </NavLink>

            <NavLink
              to="/complaints/new"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={onClose}
            >
              <i className="ti ti-plus" />
              <span>Submit Ticket</span>
            </NavLink>
          </>
        )}

        {user.role === ROLES.AGENT && (
          <>
            <NavLink
              to="/agent/dashboard"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={onClose}
            >
              <i className="ti ti-layout-dashboard" />
              <span>Agent Dashboard</span>
            </NavLink>

            <NavLink
              to="/agent/complaints"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={onClose}
            >
              <i className="ti ti-headset" />
              <span>Assigned Queue</span>
            </NavLink>
          </>
        )}

        {user.role === ROLES.ADMIN && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              onClick={onClose}
            >
              <i className="ti ti-chart-bar" />
              <span>System Analytics</span>
            </NavLink>
          </>
        )}

        {/* Management Group for Admin / Agent */}
        {(user.role === ROLES.ADMIN || user.role === ROLES.AGENT) && (
          <>
            <div className="nav-section" style={{ marginTop: "12px" }}>
              MANAGEMENT
            </div>

            {user.role === ROLES.ADMIN && (
              <>
                <NavLink
                  to="/admin/complaints"
                  className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
                  onClick={onClose}
                >
                  <i className="ti ti-clipboard-list" />
                  <span>All Complaints</span>
                </NavLink>

                <NavLink
                  to="/admin/users"
                  className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
                  onClick={onClose}
                >
                  <i className="ti ti-users" />
                  <span>Users Directory</span>
                </NavLink>

                <NavLink
                  to="/admin/agents"
                  className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
                  onClick={onClose}
                >
                  <i className="ti ti-shield" />
                  <span>Support Agents</span>
                </NavLink>
              </>
            )}
          </>
        )}

        {/* System Group */}
        <div className="nav-section" style={{ marginTop: "12px" }}>
          SYSTEM
        </div>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          onClick={onClose}
        >
          <i className="ti ti-user" />
          <span>Account Profile</span>
        </NavLink>
      </div>

      {/* User Footer */}
      <div style={styles.footer}>
        <div style={styles.userRow}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div style={styles.userText}>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userRole}>{user.role?.toUpperCase()}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.signOutBtn}
          title="Sign out of SCRS"
        >
          <i className="ti ti-logout" style={{ fontSize: "14px" }} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  footer: {
    padding: "16px 14px",
    borderTop: "1px solid var(--border)",
    background: "rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatarImg: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "var(--brand-muted)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
  },
  userText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
    overflow: "hidden",
  },
  userName: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "9px",
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
  },
  signOutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--urgent)",
    fontSize: "12px",
    fontWeight: "500",
    padding: "4px 0",
    cursor: "pointer",
    background: "transparent",
    border: "none",
  },
};

export default Sidebar;
