import { Link, useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../context";
import { Sun, Moon, LogOut, Shield, Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <button className="nav-hamburger" onClick={onMenuToggle} title="Toggle navigation">
          <Menu size={18} />
        </button>
        <Link to="/" style={styles.brand}>
          <div style={styles.logoBadge}>
            <Shield size={16} color="#38bdf8" strokeWidth={2.5} />
          </div>
          <div style={styles.brandTextGroup}>
            <span style={styles.brandTitle}>SCRS <span style={styles.brandSubtitle}>ENTERPRISE</span></span>
          </div>
        </Link>
      </div>

      {user && (
        <div style={styles.rightSection}>
          <div style={styles.statusPill} className="nav-user-text">
            <span style={styles.statusDot} />
            <span style={styles.statusText}>System Active</span>
          </div>

          <NotificationBell />

          <button
            onClick={toggleTheme}
            style={styles.themeBtn}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Desktop-only: compact user badge + logout */}
          <div style={styles.userSection} className="nav-user-text nav-logout-btn">
            <div style={styles.userBadge}>
              <div style={styles.miniAvatar}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={styles.userMeta}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: "var(--bg-navbar)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    padding: "0 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "var(--height-navbar)",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    boxSizing: "border-box",
    zIndex: 50,
    borderBottom: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-sm)",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  brand: {
    color: "var(--text-primary)",
    fontFamily: "var(--font-heading)",
    fontWeight: "800",
    fontSize: "1.15rem",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    letterSpacing: "-0.03em",
  },
  logoBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTextGroup: { display: "flex", flexDirection: "column" },
  brandTitle: { color: "var(--text-primary)", fontWeight: "800", fontSize: "1.05rem" },
  brandSubtitle: { color: "var(--accent-blue)", fontSize: "0.6rem", fontWeight: "800", letterSpacing: "0.12em", marginLeft: "0.25rem" },
  rightSection: { display: "flex", gap: "0.75rem", alignItems: "center" },
  statusPill: {
    display: "flex", alignItems: "center", gap: "0.35rem",
    background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)",
    padding: "0.2rem 0.55rem", borderRadius: "16px",
  },
  statusDot: { width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" },
  statusText: { color: "#10b981", fontSize: "0.68rem", fontWeight: "700" },
  themeBtn: {
    background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)", borderRadius: "8px", width: "32px", height: "32px",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.2s ease",
  },
  userSection: {
    display: "flex", alignItems: "center", gap: "0.6rem",
    borderLeft: "1px solid var(--border-subtle)", paddingLeft: "1rem",
  },
  userBadge: {
    display: "flex", alignItems: "center", gap: "0.55rem",
  },
  miniAvatar: {
    width: "28px", height: "28px", borderRadius: "7px",
    background: "var(--grad-primary)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "0.72rem", fontFamily: "var(--font-heading)",
    flexShrink: 0,
  },
  userMeta: { display: "flex", flexDirection: "column" },
  userName: { color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: "600", lineHeight: "1.1" },
  userRole: {
    color: "var(--accent-blue)", fontSize: "0.62rem", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.35rem",
    borderRadius: "7px", cursor: "pointer", transition: "all 0.2s ease",
    width: "28px", height: "28px",
  },
};

export default Navbar;
