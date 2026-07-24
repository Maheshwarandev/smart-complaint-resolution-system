import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      fontSize: "1.35rem", 
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      letterSpacing: "-0.03em"
    },
    brandGlow: {
      background: "var(--grad-primary)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    rightSection: { 
      display: "flex", 
      gap: "1.5rem", 
      alignItems: "center" 
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      borderLeft: "1px solid var(--border-subtle)",
      paddingLeft: "1.5rem"
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
      fontSize: "0.9rem",
      fontWeight: "600"
    },
    btn: { 
      background: "rgba(248, 113, 113, 0.1)", 
      color: "#f87171", 
      border: "1px solid rgba(248, 113, 113, 0.2)", 
      padding: "0.4rem 0.9rem", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontSize: "0.85rem",
      fontWeight: "600",
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

  const [hoverLogout, setHoverLogout] = useState(false);

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        🛡️ <span style={styles.brandGlow}>SCRS</span>
      </Link>

      {user && (
        <div style={styles.rightSection}>
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
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  objectFit: "cover", border: "1px solid var(--accent-blue)",
                  boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)"
                }}
              />
            ) : (
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--grad-primary)", color: "#fff", display: "flex",
                alignItems: "center", justifyContent: "center", fontWeight: "700",
                boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
                fontFamily: "var(--font-heading)"
              }}>
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
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
