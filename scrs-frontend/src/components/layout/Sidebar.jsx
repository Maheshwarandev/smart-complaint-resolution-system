import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = ({ isOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
      {/* Brand Identity / Role Indicator */}
      <div style={s.brandBadge}>
        <span style={s.brandDot} />
        <span style={s.brandRole}>{user.role?.toUpperCase()} PORTAL</span>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-label">NAVIGATION</div>
        
        {user.role === "user" && (
          <>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>📊</span> Executive Overview
            </NavLink>
            <NavLink to="/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>📋</span> My Complaints
            </NavLink>
            <NavLink to="/complaints/new" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>⚡</span> Submit New Ticket
            </NavLink>
          </>
        )}

        {user.role === "agent" && (
          <>
            <NavLink to="/agent/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>📊</span> Agent Workspace
            </NavLink>
            <NavLink to="/agent/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>🛠️</span> Assigned Queue
            </NavLink>
          </>
        )}

        {user.role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>📈</span> System Analytics
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>👥</span> User Management
            </NavLink>
            <NavLink to="/admin/agents" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>🛡️</span> Support Engineers
            </NavLink>
            <NavLink to="/admin/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <span style={s.icon}>📋</span> All System Complaints
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-group" style={s.settingsGroup}>
        <div className="sidebar-label">ACCOUNT & PREFERENCES</div>
        <NavLink to="/profile" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <span style={s.icon}>👤</span> Account Profile
        </NavLink>
        <button onClick={handleLogout} className="sidebar-logout">
          <span style={s.icon}>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

const s = {
  brandBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem 0.9rem",
    background: "rgba(56, 189, 248, 0.06)",
    border: "1px solid rgba(56, 189, 248, 0.15)",
    borderRadius: "10px",
    marginBottom: "1.5rem"
  },
  brandDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 10px #10b981"
  },
  brandRole: {
    color: "var(--accent-blue)",
    fontSize: "0.75rem",
    fontWeight: "800",
    letterSpacing: "0.08em"
  },
  icon: {
    fontSize: "1.05rem",
    marginRight: "0.4rem"
  },
  settingsGroup: {
    borderTop: "1px solid var(--border-subtle)",
    paddingTop: "1.25rem",
    marginTop: "auto"
  }
};

export default Sidebar;
