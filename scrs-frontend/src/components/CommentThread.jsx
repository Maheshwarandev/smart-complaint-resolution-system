import React, { useState } from "react";
import { useAuth } from "../context";

const CommentThread = ({ comments = [], onAddComment }) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await onAddComment(text.trim());
      setText("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="ti ti-messages" style={{ fontSize: "16px", color: "var(--brand)" }} />
          <span style={styles.headerTitle}>Conversation</span>
        </div>
        <span style={styles.replyCount}>{comments.length} replies</span>
      </div>

      <div style={styles.commentList}>
        {comments.length === 0 ? (
          <div style={styles.emptyText}>
            No messages in this thread yet. Write a reply below to update the ticket.
          </div>
        ) : (
          comments.map((c, idx) => {
            const commentUser = c.user || {};
            const isAgent = commentUser.role === "agent" || commentUser.role === "admin";
            const avatarUrl = commentUser.avatar;
            const name = commentUser.name || "User";
            const role = commentUser.role || "user";

            return (
              <div key={c._id || idx} style={styles.commentRow}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} style={styles.avatarImg} />
                ) : (
                  <div
                    style={{
                      ...styles.avatarFallback,
                      background: isAgent ? "var(--brand-muted)" : "var(--bg-hover)",
                      color: isAgent ? "#FFFFFF" : "var(--text-primary)",
                      borderColor: isAgent ? "var(--brand)" : "var(--border)",
                    }}
                  >
                    {name[0]?.toUpperCase() || "U"}
                  </div>
                )}

                <div
                  style={{
                    ...styles.bubble,
                    background: isAgent ? "var(--brand-subtle)" : "var(--bg-elevated)",
                    borderColor: isAgent ? "var(--brand-muted)" : "var(--border)",
                  }}
                >
                  <div style={styles.bubbleHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={styles.senderName}>{name}</span>
                      <span
                        className="badge-status"
                        style={{
                          background: isAgent ? "var(--brand)" : "var(--bg-hover)",
                          color: isAgent ? "#FFFFFF" : "var(--text-secondary)",
                          fontSize: "10px",
                          padding: "1px 6px",
                          textTransform: "uppercase",
                        }}
                      >
                        {role}
                      </span>
                    </div>
                    <span style={styles.time}>
                      {new Date(c.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p style={styles.commentText}>{c.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Input */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.userAvatarSmall}>
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <input
          type="text"
          placeholder="Write a reply or resolution message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="btn-primary"
          style={{ height: "38px", padding: "0 16px" }}
        >
          {loading ? "Posting..." : "Send Reply →"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid var(--border)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  headerTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  replyCount: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
  },
  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "360px",
    overflowY: "auto",
    marginBottom: "14px",
    paddingRight: "4px",
  },
  emptyText: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontStyle: "italic",
    padding: "8px 0",
  },
  commentRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  avatarImg: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    marginTop: "2px",
  },
  avatarFallback: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "600",
    flexShrink: 0,
    border: "1px solid",
    marginTop: "2px",
  },
  bubble: {
    flex: 1,
    border: "1px solid",
    borderRadius: "0 var(--radius-lg) var(--radius-lg) var(--radius-lg)",
    padding: "10px 14px",
  },
  bubbleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  senderName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  time: {
    fontSize: "10px",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
  },
  commentText: {
    fontSize: "13px",
    color: "var(--text-primary)",
    lineHeight: "1.5",
    margin: 0,
  },
  form: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  userAvatarSmall: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "var(--brand)",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    height: "38px",
  },
};

export default CommentThread;
