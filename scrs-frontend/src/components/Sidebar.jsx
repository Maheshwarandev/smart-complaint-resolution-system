import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context";
import { ROLES } from "../constants";
import {
  LayoutDashboard, FileText, Plus, BarChart3, Users,
  Shield, UserCircle, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";

const Sidebar = ({ isOpen, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const collapsed = isCollapsed;

  return (
    <aside className={`sidebar-container ${isOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
      {/* Collapse toggle */}
      <button className="sidebar-collapse-toggle" onClick={onToggleCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {/* Brand badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
          gap: "0.5rem", padding: "0.45rem 0.7rem", marginBottom: "0.75rem",
          borderRadius: "8px", background: "rgba(56, 189, 248, 0.06)",
          border: "1px solid rgba(56, 189, 248, 0.12)", overflow: "hidden",
        }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "6px", background: "rgba(56, 189, 248, 0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Shield size={13} color="#38bdf8" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="sidebar-brand-text" style={{
              color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: "800",
              fontFamily: "var(--font-heading)", whiteSpace: "nowrap",
            }}>SCRS</span>
          )}
        </div>

        {/* Navigation */}
        <div className="sidebar-group">
          {!collapsed && <div className="sidebar-label">NAVIGATION</div>}

          {user.role === ROLES.USER && (
            <>
              <NavLink to="/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <LayoutDashboard size={18} />
                {!collapsed && <span className="sidebar-link-label">Executive Overview</span>}
              </NavLink>
              <NavLink to="/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <FileText size={18} />
                {!collapsed && <span className="sidebar-link-label">My Complaints</span>}
              </NavLink>
              <NavLink to="/complaints/new" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <Plus size={18} />
                {!collapsed && <span className="sidebar-link-label">Submit New Ticket</span>}
              </NavLink>
            </>
          )}

          {user.role === ROLES.AGENT && (
            <>
              <NavLink to="/agent/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <LayoutDashboard size={18} />
                {!collapsed && <span className="sidebar-link-label">Agent Workspace</span>}
              </NavLink>
              <NavLink to="/agent/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <BarChart3 size={18} />
                {!collapsed && <span className="sidebar-link-label">Assigned Queue</span>}
              </NavLink>
            </>
          )}

          {user.role === ROLES.ADMIN && (
            <>
              <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <BarChart3 size={18} />
                {!collapsed && <span className="sidebar-link-label">System Analytics</span>}
              </NavLink>
              <NavLink to="/admin/users" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <Users size={18} />
                {!collapsed && <span className="sidebar-link-label">User Management</span>}
              </NavLink>
              <NavLink to="/admin/agents" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <Shield size={18} />
                {!collapsed && <span className="sidebar-link-label">Support Engineers</span>}
              </NavLink>
              <NavLink to="/admin/complaints" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                <FileText size={18} />
                {!collapsed && <span className="sidebar-link-label">All System Complaints</span>}
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Footer: user profile + logout */}
      <div className="sidebar-footer">
        <div className="sidebar-group">
          {!collapsed && <div className="sidebar-label">ACCOUNT</div>}

          <NavLink to="/profile" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <UserCircle size={18} />
            {!collapsed && <span className="sidebar-link-label">Profile</span>}
          </NavLink>
        </div>

        <div className="sidebar-user-block">
          <div className="sidebar-user-avatar" style={{
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))",
          }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info" style={{ overflow: "hidden", minWidth: 0 }}>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="sidebar-logout" title="Sign Out">
          <LogOut size={18} />
          {!collapsed && <span className="sidebar-logout-label">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
