import React, { useState, useEffect } from "react";

const SLABadge = ({ deadline, breached, status, resolvedAt }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [slaState, setSlaState] = useState("ontrack"); // 'overdue' | 'critical' | 'warning' | 'ontrack'

  useEffect(() => {
    if (!deadline) return;

    const isClosed = status === "Resolved" || status === "Closed";
    if (isClosed) return;

    const calculateTime = () => {
      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setSlaState("overdue");
        setTimeLeft("SLA Overdue");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours < 4) {
        setSlaState("critical");
      } else if (hours < 12) {
        setSlaState("warning");
      } else {
        setSlaState("ontrack");
      }

      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (!deadline && !breached) return null;

  const isClosed = status === "Resolved" || status === "Closed";

  if (isClosed) {
    if (breached) {
      return (
        <span className="badge-status badge-sla-overdue" title="Resolved after SLA deadline">
          <i className="ti ti-clock-x" style={{ fontSize: "12px" }} />
          <span>SLA Overdue</span>
        </span>
      );
    }
    return (
      <span className="badge-status badge-sla-ontrack" title="Resolved within target SLA window">
        <i className="ti ti-clock-check" style={{ fontSize: "12px" }} />
        <span>Resolved on track</span>
      </span>
    );
  }

  if (breached || slaState === "overdue") {
    return (
      <span className="badge-status badge-sla-overdue" title="Target SLA deadline missed">
        <i className="ti ti-clock-x" style={{ fontSize: "12px" }} />
        <span>{timeLeft || "SLA Overdue"}</span>
      </span>
    );
  }

  if (slaState === "critical") {
    return (
      <span className="badge-status badge-sla-critical" title="Critical SLA deadline approaching">
        <i className="ti ti-clock-hour-4" style={{ fontSize: "12px" }} />
        <span>{timeLeft}</span>
      </span>
    );
  }

  if (slaState === "warning") {
    return (
      <span className="badge-status badge-sla-warning" title="SLA deadline approaching">
        <i className="ti ti-clock" style={{ fontSize: "12px" }} />
        <span>{timeLeft}</span>
      </span>
    );
  }

  return (
    <span className="badge-status badge-sla-ontrack" title="Within standard target resolution window">
      <i className="ti ti-clock-check" style={{ fontSize: "12px" }} />
      <span>{timeLeft}</span>
    </span>
  );
};

export default SLABadge;
