import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [hoverLogout, setHoverLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <div style={styles.logoBadge}>🛡️</div>
        <div style={styles.brandTextGroup}>
          <span style={styles.brandTitle}>SCRS <span style={styles.brandSubtitle}>ENTERPRISE</span></span>
        </div>
      </Link>

      {user && (
        <div style={styles.rightSection}>
          <div style={styles.statusPill} className="nav-user-text">
            <span style={styles.statusDot} />
            <span style={styles.statusText}>System Active</span>
          </div>

          <button 
            onClick={toggleTheme} 
            style={styles.themeBtn}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div style={styles.userInfo} className="nav-user-info">
            <div className="nav-user-text" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={styles.name}>{user.name}</span>
              <span style={styles.role}>{user.role}</span>
            </div>

            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarFallback}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <button 
              onClick={handleLogout} 
              onMouseEnter={() => setHoverLogout(true)}
              onMouseLeave={() => setHoverLogout(false)}
              className="nav-logout-btn"
              style={{
                ...styles.btn,
                ...(hoverLogout ? styles.btnHover : {})
              }}
            >
              Sign Out
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
    padding: "0 2rem", 
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
    boxShadow: "var(--shadow-sm)"
  },
  brand: { 
    color: "var(--text-primary)", 
    fontFamily: "var(--font-heading)",
    fontWeight: "800", 
    fontSize: "1.25rem", 
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    letterSpacing: "-0.03em"
  },
  logoBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem"
  },
  brandTextGroup: {
    display: "flex",
    flexDirection: "column"
  },
  brandTitle: {
    color: "var(--text-primary)",
    fontWeight: "800",
    fontSize: "1.15rem"
  },
  brandSubtitle: {
    color: "var(--accent-blue)",
    fontSize: "0.65rem",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginLeft: "0.3rem"
  },
  rightSection: { 
    display: "flex", 
    gap: "1.25rem", 
    alignItems: "center" 
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    padding: "0.25rem 0.65rem",
    borderRadius: "20px"
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow: "0 0 8px #10b981"
  },
  statusText: {
    color: "#10b981",
    fontSize: "0.72rem",
    fontWeight: "700"
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    borderLeft: "1px solid var(--border-subtle)",
    paddingLeft: "1.25rem"
  },
  role: { 
    background: "rgba(56, 189, 248, 0.1)",
    color: "var(--accent-blue)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    padding: "0.15rem 0.5rem",
    borderRadius: "12px",
    fontSize: "0.7rem", 
    fontWeight: "700",
    textTransform: "uppercase", 
    letterSpacing: "0.05em" 
  },
  name: { 
    color: "var(--text-primary)", 
    fontSize: "0.88rem",
    fontWeight: "600"
  },
  avatarImg: {
    width: "36px", 
    height: "36px", 
    borderRadius: "50%",
    objectFit: "cover", 
    border: "1px solid var(--accent-blue)",
    boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)"
  },
  avatarFallback: {
    width: "36px", 
    height: "36px", 
    borderRadius: "50%",
    background: "var(--grad-primary)", 
    color: "#fff", 
    display: "flex",
    alignItems: "center", 
    justifyContent: "center", 
    fontWeight: "700",
    boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
    fontFamily: "var(--font-heading)"
  },
  btn: { 
    background: "rgba(244, 63, 94, 0.1)", 
    color: "#f43f5e", 
    border: "1px solid rgba(244, 63, 94, 0.25)", 
    padding: "0.4rem 0.9rem", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontSize: "0.82rem",
    fontWeight: "700",
    transition: "all 0.2s ease",
    fontFamily: "var(--font-heading)"
  },
  btnHover: {
    background: "var(--grad-danger)",
    color: "#ffffff",
    borderColor: "transparent"
  },
  themeBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "all 0.2s ease"
  }
};

export default Navbar;
