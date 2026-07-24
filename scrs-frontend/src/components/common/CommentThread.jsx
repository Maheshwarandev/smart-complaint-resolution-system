import { useState } from "react";
import useAuth from "../../hooks/useAuth";

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
    <div style={s.container}>
      <h4 style={s.headerTitle}>💬 Conversation Thread ({comments.length})</h4>

      <div style={s.commentList}>
        {comments.length === 0 ? (
          <p style={s.emptyText}>No messages yet. Start the conversation below!</p>
        ) : (
          comments.map((c, idx) => {
            const commentUser = c.user || {};
            const isMe = commentUser._id === user?._id;
            const avatarUrl = commentUser.avatar;
            const name = commentUser.name || "User";
            const role = commentUser.role || "user";

            return (
              <div key={c._id || idx} style={{ ...s.commentRow, flexDirection: isMe ? "row-reverse" : "row" }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} style={s.avatarImg} />
                ) : (
                  <div style={s.avatarFallback}>
                    {name[0]?.toUpperCase() || "U"}
                  </div>
                )}

                <div style={{ ...s.bubble, alignSelf: isMe ? "flex-end" : "flex-start", background: isMe ? "rgba(14, 165, 233, 0.15)" : "rgba(255, 255, 255, 0.03)" }}>
                  <div style={s.bubbleHeader}>
                    <span style={s.senderName}>{name}</span>
                    <span style={s.roleBadge}>{role}</span>
                    <span style={s.time}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={s.commentText}>{c.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} style={s.form}>
        <input
          type="text"
          placeholder="Type a message or response..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={s.input}
        />
        <button type="submit" disabled={loading || !text.trim()} style={s.sendBtn}>
          {loading ? "Sending..." : "Send 🚀"}
        </button>
      </form>
    </div>
  );
};

const s = {
  container: {
    marginTop: "1.5rem",
    paddingTop: "1.25rem",
    borderTop: "1px solid var(--border-subtle)"
  },
  headerTitle: {
    margin: "0 0 1rem",
    color: "var(--text-primary)",
    fontSize: "1rem",
    fontWeight: "700"
  },
  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "350px",
    overflowY: "auto",
    paddingRight: "0.25rem",
    marginBottom: "1rem"
  },
  emptyText: {
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
    fontStyle: "italic",
    margin: 0
  },
  commentRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-start"
  },
  avatarImg: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid var(--border-subtle)"
  },
  avatarFallback: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "var(--grad-primary)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "0.9rem",
    flexShrink: 0
  },
  bubble: {
    borderRadius: "12px",
    padding: "0.75rem 1rem",
    border: "1px solid var(--border-subtle)",
    maxWidth: "80%"
  },
  bubbleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.35rem"
  },
  senderName: {
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    fontWeight: "700"
  },
  roleBadge: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "var(--accent-blue)",
    padding: "0.1rem 0.4rem",
    borderRadius: "6px",
    fontSize: "0.68rem",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  time: {
    color: "var(--text-muted)",
    fontSize: "0.72rem",
    marginLeft: "auto"
  },
  commentText: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
    lineHeight: "1.45"
  },
  form: {
    display: "flex",
    gap: "0.5rem"
  },
  input: {
    flex: 1,
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
    padding: "0.65rem 0.9rem",
    color: "var(--text-primary)",
    fontSize: "0.88rem",
    outline: "none"
  },
  sendBtn: {
    background: "var(--grad-primary)",
    color: "#ffffff",
    border: "none",
    padding: "0.65rem 1.25rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.85rem",
    cursor: "pointer"
  }
};

export default CommentThread;
