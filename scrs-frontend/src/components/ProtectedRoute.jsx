import { Navigate } from "react-router-dom";
import { useAuth } from "../context";

// Wraps any route that requires authentication
// allowedRoles: optional array — if provided, also checks role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Still checking localStorage / verifying token — show inline spinner
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "3rem", gap: "0.75rem" }}>
      <i className="ti ti-loader-2" style={{ fontSize: "32px", color: "#38bdf8", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Not logged in → send to login page
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role (e.g. user trying to access /admin)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // All checks passed → render the actual page
  return children;
};

export default ProtectedRoute;
