import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <aside className="sidebar-container">
      <div className="sidebar-group">
        <div className="sidebar-label">MENU</div>
        
        {user.role === "user" && (
          <>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>🏠 Dashboard</NavLink>
            <NavLink to="/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>📝 My Complaints</NavLink>
            <NavLink to="/complaints/new" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>➕ Submit Complaint</NavLink>
          </>
        )}

        {user.role === "agent" && (
          <>
            <NavLink to="/agent/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>🏠 Dashboard</NavLink>
            <NavLink to="/agent/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>📋 Assigned Complaints</NavLink>
          </>
        )}

        {user.role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>📊 Dashboard</NavLink>
            <NavLink to="/admin/users" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>👥 Users</NavLink>
            <NavLink to="/admin/agents" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>🛠️ Agents</NavLink>
            <NavLink to="/admin/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>📋 Complaints</NavLink>
          </>
        )}
      </div>

      <div className="sidebar-group" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
        <div className="sidebar-label">SETTINGS</div>
        <NavLink to="/profile" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>👤 Profile</NavLink>
        <button onClick={handleLogout} className="sidebar-logout">🚪 Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
