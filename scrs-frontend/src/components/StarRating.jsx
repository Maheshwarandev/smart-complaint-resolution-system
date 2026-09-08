import React, { useState } from "react";

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
      <div style={styles.readonlyContainer}>
        <div style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={star <= starCount ? "ti ti-star-filled" : "ti ti-star"}
              style={{
                color: star <= starCount ? "#E3A008" : "var(--text-muted)",
                fontSize: "15px",
              }}
            />
          ))}
          <span style={styles.scoreBadge}>{starCount}/5</span>
        </div>
        {rating?.feedback && (
          <p style={styles.feedbackText}>"{rating.feedback}"</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.interactiveCard}>
      <div style={styles.cardTitle}>
        <i className="ti ti-star" style={{ color: "var(--open)", fontSize: "16px" }} />
        <span>Rate Resolution Quality</span>
      </div>
      <p style={styles.cardSub}>How satisfied are you with the outcome of this ticket?</p>

      <div style={styles.starsInteractiveRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hoverScore || score);
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(0)}
              style={styles.starBtn}
            >
              <i
                className={active ? "ti ti-star-filled" : "ti ti-star"}
                style={{
                  color: active ? "#E3A008" : "var(--text-muted)",
                  fontSize: "22px",
                }}
              />
            </button>
          );
        })}
        {score > 0 && <span style={styles.activeScoreLabel}>{score} / 5</span>}
      </div>

      <textarea
        placeholder="Optional feedback about your resolution experience..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={2}
        style={{ marginTop: "10px", fontSize: "12px" }}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
        <button
          type="submit"
          disabled={submitting || !score}
          className="btn-primary"
          style={{ height: "32px", fontSize: "12px", padding: "0 14px" }}
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </button>
      </div>
    </form>
  );
};

const styles = {
  readonlyContainer: {
    padding: "8px 12px",
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
  },
  starsRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  scoreBadge: {
    marginLeft: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#E3A008",
  },
  feedbackText: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontStyle: "italic",
  },
  interactiveCard: {
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "14px 16px",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  cardSub: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    margin: "2px 0 10px",
  },
  starsInteractiveRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  starBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  activeScoreLabel: {
    marginLeft: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#E3A008",
  },
};

export default StarRating;
