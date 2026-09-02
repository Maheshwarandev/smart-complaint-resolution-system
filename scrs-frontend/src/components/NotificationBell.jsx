import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from "../api/notifications";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const res = await getNotificationsAPI();
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // Ignore background poll errors
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30-sec polling
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadAPI();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationReadAPI(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setIsOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error("Error clicking notification:", err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "comment":
        return "💬";
      case "status":
        return "📌";
      case "assignment":
        return "⚡";
      case "rating":
        return "⭐";
      default:
        return "🛡️";
    }
  };

  const formatTime = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button
        type="button"
        style={styles.bellBtn}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Notifications"
      >
        <span style={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown} className="glass-panel animate-slide-up">
          <div style={styles.dropdownHeader}>
            <div style={styles.headerLeft}>
              <strong style={styles.headerTitle}>Notifications</strong>
              {unreadCount > 0 && (
                <span style={styles.unreadPill}>{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={styles.markAllBtn}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>📭</span>
                No notifications yet
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    ...styles.item,
                    background: item.read ? "transparent" : "rgba(56, 189, 248, 0.08)",
                  }}
                  className="hover-lift"
                >
                  <div style={styles.itemIcon}>{getTypeIcon(item.type)}</div>
                  <div style={styles.itemContent}>
                    <div style={styles.itemTitleRow}>
                      <span style={{ ...styles.itemTitle, fontWeight: item.read ? "600" : "800" }}>
                        {item.title}
                      </span>
                      <span style={styles.itemTime}>{formatTime(item.createdAt)}</span>
                    </div>
                    <p style={styles.itemMsg}>{item.message}</p>
                  </div>
                  {!item.read && <span style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    display: "inline-block",
  },
  bellBtn: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  bellIcon: {
    fontSize: "1.1rem",
  },
  badge: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    color: "#ffffff",
    fontSize: "0.68rem",
    fontWeight: "800",
    borderRadius: "10px",
    padding: "0.15rem 0.4rem",
    minWidth: "16px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(244, 63, 94, 0.5)",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 12px)",
    width: "360px",
    maxHeight: "440px",
    background: "var(--bg-surface-solid, #0d1320)",
    border: "1px solid var(--border-glow, rgba(56, 189, 248, 0.25))",
    borderRadius: "16px",
    boxShadow: "var(--shadow-lg, 0 20px 50px rgba(0, 0, 0, 0.65))",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "0.9rem 1.2rem",
    borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255, 255, 255, 0.02)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  headerTitle: {
    color: "var(--text-primary, #f8fafc)",
    fontSize: "0.95rem",
    fontFamily: "var(--font-heading)",
  },
  unreadPill: {
    background: "rgba(56, 189, 248, 0.15)",
    color: "var(--accent-blue, #38bdf8)",
    padding: "0.15rem 0.45rem",
    borderRadius: "10px",
    fontSize: "0.7rem",
    fontWeight: "700",
  },
  markAllBtn: {
    background: "transparent",
    border: "none",
    color: "var(--accent-blue, #38bdf8)",
    fontSize: "0.75rem",
    fontWeight: "700",
    cursor: "pointer",
    padding: "0.2rem 0.4rem",
  },
  list: {
    overflowY: "auto",
    maxHeight: "360px",
  },
  emptyState: {
    padding: "2.5rem 1.5rem",
    textAlign: "center",
    color: "var(--text-secondary, #94a3b8)",
    fontSize: "0.88rem",
  },
  item: {
    display: "flex",
    gap: "0.75rem",
    padding: "0.85rem 1.15rem",
    borderBottom: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.04))",
    cursor: "pointer",
    transition: "background 0.15s ease",
    alignItems: "flex-start",
  },
  itemIcon: {
    fontSize: "1.1rem",
    marginTop: "2px",
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.2rem",
  },
  itemTitle: {
    color: "var(--text-primary, #f8fafc)",
    fontSize: "0.85rem",
  },
  itemTime: {
    color: "var(--text-muted, #64748b)",
    fontSize: "0.72rem",
  },
  itemMsg: {
    margin: 0,
    color: "var(--text-secondary, #94a3b8)",
    fontSize: "0.78rem",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  unreadDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#38bdf8",
    marginTop: "6px",
    boxShadow: "0 0 8px #38bdf8",
  },
};

export default NotificationBell;
