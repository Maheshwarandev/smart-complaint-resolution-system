import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../context";
import NotificationBell from "./NotificationBell";

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="app-topbar">
      <div style={styles.left}>
        <button
          type="button"
          onClick={onMenuToggle}
          style={styles.menuBtn}
          title="Toggle sidebar"
        >
          <i className="ti ti-menu-2" style={{ fontSize: "18px" }} />
        </button>

        <Link to="/" style={styles.brand}>
          <div style={styles.brandLogo}>
            <i className="ti ti-shield-check" style={{ fontSize: "18px", color: "var(--brand)" }} />
          </div>
          <div style={styles.brandText}>
            <span style={styles.brandName}>SCRS</span>
            <span style={styles.brandTag}>ENTERPRISE</span>
          </div>
        </Link>
      </div>

      {user && (
        <div style={styles.right}>
          {/* System Active Pill */}
          <div style={styles.statusPill}>
            <span className="status-dot-pulse" />
            <span>System Active</span>
          </div>

          {/* In-App Notifications */}
          <NotificationBell />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={styles.iconBtn}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <i className={theme === "dark" ? "ti ti-sun" : "ti ti-moon"} style={{ fontSize: "16px" }} />
          </button>

          {/* User Chip */}
          <div style={styles.userChip} onClick={() => navigate("/profile")} title="Account Profile">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarCircle}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div style={styles.userMeta}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userRole}>{user.role}</span>
            </div>
            <i className="ti ti-chevron-down" style={{ fontSize: "12px", color: "var(--text-muted)" }} />
          </div>
        </div>
      )}
    </header>
  );
};

const styles = {
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  menuBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    padding: "6px",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  },
  brandLogo: {
    width: "28px",
    height: "28px",
    borderRadius: "var(--radius-md)",
    background: "var(--brand-subtle)",
    border: "1px solid var(--brand-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
  },
  brandName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
  },
  brandTag: {
    fontSize: "9px",
    fontFamily: "var(--font-mono)",
    color: "var(--text-muted)",
    letterSpacing: "0.08em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  statusPill: {
    background: "var(--resolved-bg)",
    color: "var(--resolved)",
    border: "1px solid rgba(14, 159, 110, 0.3)",
    borderRadius: "20px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  iconBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 150ms ease",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "3px 8px 3px 4px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "background 150ms ease",
    border: "1px solid transparent",
  },
  avatarImg: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "var(--brand)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.15,
  },
  userName: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--text-primary)",
  },
  userRole: {
    fontSize: "10px",
    color: "var(--text-muted)",
    textTransform: "capitalize",
  },
};

export default Navbar;
