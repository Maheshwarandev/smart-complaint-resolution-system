import React, { useState, useEffect } from "react";

/**
 * SLABadge component
 * Displays live SLA countdown timer and breach warnings.
 */
const SLABadge = ({ deadline, breached, status, resolvedAt }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isBreachedNow, setIsBreachedNow] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    const isClosed = status === "Resolved" || status === "Closed";
    if (isClosed) return;

    const calculateTime = () => {
      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsBreachedNow(true);
        setTimeLeft("SLA Breached");
        return;
      }

      setIsBreachedNow(false);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours < 4) {
        setIsUrgent(true);
      } else {
        setIsUrgent(false);
      }

      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (!deadline && !breached) return null;

  const isClosed = status === "Resolved" || status === "Closed";

  if (isClosed) {
    if (breached) {
      return (
        <span style={styles.badgeBreached} title="Resolved after target SLA deadline">
          ⚠️ SLA Breached
        </span>
      );
    }
    return (
      <span style={styles.badgeSuccess} title="Resolved within target SLA deadline">
        ✓ Within SLA
      </span>
    );
  }

  if (isBreachedNow || breached) {
    return (
      <span style={styles.badgeBreached} title="Target SLA deadline has passed">
        ⚠️ SLA Breached
      </span>
    );
  }

  if (isUrgent) {
    return (
      <span style={styles.badgeUrgent} title="Approaching SLA deadline">
        🔥 {timeLeft}
      </span>
    );
  }

  return (
    <span style={styles.badgeNormal} title="Time remaining before target resolution deadline">
      ⏱️ {timeLeft}
    </span>
  );
};

const styles = {
  badgeNormal: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    background: "rgba(56, 189, 248, 0.12)",
    color: "var(--accent-blue, #38bdf8)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "0.02em",
  },
  badgeUrgent: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    background: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.35)",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "800",
    letterSpacing: "0.02em",
  },
  badgeBreached: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    background: "rgba(244, 63, 94, 0.15)",
    color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.35)",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "800",
    letterSpacing: "0.02em",
  },
  badgeSuccess: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    background: "rgba(16, 185, 129, 0.12)",
    color: "#10b981",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "0.02em",
  },
};

export default SLABadge;
