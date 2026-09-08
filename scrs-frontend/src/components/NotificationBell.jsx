import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from "../api";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
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
      // Ignore background fetch error
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

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
        return <i className="ti ti-message-circle" style={{ color: "#7C3AED" }} />;
      case "status":
        return <i className="ti ti-checkup-list" style={{ color: "var(--open)" }} />;
      case "assignment":
        return <i className="ti ti-user-check" style={{ color: "var(--brand)" }} />;
      case "rating":
        return <i className="ti ti-star" style={{ color: "var(--open)" }} />;
      default:
        return <i className="ti ti-info-circle" style={{ color: "var(--brand)" }} />;
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
        <i className="ti ti-bell" style={{ fontSize: "16px", color: "var(--text-secondary)" }} />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={styles.title}>Notifications</span>
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
              <div style={styles.empty}>
                <i className="ti ti-bell-off" style={{ fontSize: "28px", color: "var(--text-muted)", marginBottom: "6px" }} />
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    ...styles.item,
                    background: item.read ? "transparent" : "var(--brand-subtle)",
                  }}
                >
                  <div style={styles.itemIcon}>{getTypeIcon(item.type)}</div>
                  <div style={styles.itemContent}>
                    <div style={styles.itemTitleRow}>
                      <span style={{ ...styles.itemTitle, fontWeight: item.read ? 400 : 600 }}>
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
    width: "34px",
    height: "34px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 150ms ease",
  },
  badge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: "var(--brand)",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "600",
    borderRadius: "10px",
    padding: "1px 5px",
    minWidth: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: "340px",
    maxHeight: "420px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-primary)",
  },
  unreadPill: {
    background: "var(--brand-subtle)",
    color: "var(--brand)",
    padding: "1px 6px",
    borderRadius: "var(--radius-sm)",
    fontSize: "10px",
    fontWeight: "500",
  },
  markAllBtn: {
    background: "transparent",
    border: "none",
    color: "var(--brand)",
    fontSize: "12px",
    cursor: "pointer",
    padding: 0,
  },
  list: {
    overflowY: "auto",
    maxHeight: "340px",
  },
  empty: {
    padding: "36px 16px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  item: {
    display: "flex",
    gap: "10px",
    padding: "10px 14px",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
    transition: "background 120ms ease",
    alignItems: "flex-start",
  },
  itemIcon: {
    fontSize: "16px",
    marginTop: "1px",
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
  },
  itemTitle: {
    color: "var(--text-primary)",
    fontSize: "12px",
  },
  itemTime: {
    color: "var(--text-muted)",
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
  },
  itemMsg: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "12px",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  unreadDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--brand)",
    marginTop: "6px",
  },
};

export default NotificationBell;
