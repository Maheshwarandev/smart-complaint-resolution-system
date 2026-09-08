// Tiny inline component — too small to need its own file
export const Spinner = ({ size = 32, text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "3rem", gap: "0.75rem" }}>
    <i
      className="ti ti-loader-2"
      style={{ fontSize: `${size}px`, color: "#38bdf8", animation: "spin 1s linear infinite" }}
    />
    {text && (
      <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem", fontWeight: "500" }}>
        {text}
      </span>
    )}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export { default as ErrorBoundary }    from "./ErrorBoundary";
export { default as ActivityTimeline } from "./ActivityTimeline";
export { default as AttachmentList }   from "./AttachmentList";
export { default as CommentThread }    from "./CommentThread";
export { default as ConfirmModal }     from "./ConfirmModal";
export { default as StarRating }       from "./StarRating";
export { default as SLABadge }         from "./SLABadge";
export { default as NotificationBell } from "./NotificationBell";
export { default as MainLayout }       from "./MainLayout";
export { default as Navbar }           from "./Navbar";
export { default as ProtectedRoute }   from "./ProtectedRoute";
export { default as Sidebar }          from "./Sidebar";
