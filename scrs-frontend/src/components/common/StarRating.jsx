import { useState } from "react";

const StarRating = ({ rating, onRate, readonly = false }) => {
  const [hoverScore, setHoverScore] = useState(0);
  const [score, setScore] = useState(rating?.score || 0);
  const [feedback, setFeedback] = useState(rating?.feedback || "");
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (num) => {
    if (readonly) return;
    setScore(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!score || score < 1) {
      alert("Please select a star rating (1 to 5 stars).");
      return;
    }
    setSubmitting(true);
    try {
      await onRate(score, feedback);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (readonly) {
    const starCount = rating?.score || 0;
    if (!starCount) return null;

    return (
      <div style={s.readonlyContainer}>
        <div style={s.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} style={{ color: star <= starCount ? "#f59e0b" : "#475569", fontSize: "1rem" }}>
              ★
            </span>
          ))}
          <span style={s.scoreBadge}>{starCount}/5</span>
        </div>
        {rating?.feedback && (
          <p style={s.feedbackText}>"{rating.feedback}"</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={s.interactiveCard} className="glass-panel">
      <h4 style={s.cardTitle}>⭐ Rate Resolution Quality</h4>
      <p style={s.cardSub}>How satisfied are you with the resolution of this complaint?</p>

      <div style={s.starsInteractiveRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hoverScore || score);
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(0)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.75rem",
                cursor: "pointer",
                color: active ? "#f59e0b" : "#64748b",
                transition: "transform 0.15s ease",
                transform: active ? "scale(1.2)" : "scale(1)"
              }}
            >
              ★
            </button>
          );
        })}
      </div>

      <textarea
        placeholder="Add your feedback (optional)..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        style={s.textarea}
        rows={2}
      />

      <button type="submit" disabled={submitting || score === 0} style={s.submitBtn}>
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
};

const s = {
  readonlyContainer: {
    background: "rgba(245, 158, 11, 0.08)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    borderRadius: "10px",
    padding: "0.6rem 0.9rem",
    marginTop: "0.5rem"
  },
  starsRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem"
  },
  scoreBadge: {
    color: "#f59e0b",
    fontWeight: "700",
    fontSize: "0.85rem",
    marginLeft: "0.5rem"
  },
  feedbackText: {
    margin: "0.35rem 0 0",
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    fontStyle: "italic"
  },
  interactiveCard: {
    padding: "1.25rem",
    borderRadius: "12px",
    marginTop: "1rem",
    border: "1px solid rgba(245, 158, 11, 0.25)",
    background: "rgba(245, 158, 11, 0.04)"
  },
  cardTitle: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "1.05rem",
    fontWeight: "700"
  },
  cardSub: {
    margin: "0.25rem 0 0.75rem",
    color: "var(--text-secondary)",
    fontSize: "0.85rem"
  },
  starsInteractiveRow: {
    display: "flex",
    gap: "0.4rem",
    marginBottom: "0.75rem"
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "8px",
    padding: "0.6rem 0.8rem",
    color: "var(--text-primary)",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    resize: "none",
    marginBottom: "0.75rem"
  },
  submitBtn: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.5rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "0.85rem",
    cursor: "pointer"
  }
};

export default StarRating;
