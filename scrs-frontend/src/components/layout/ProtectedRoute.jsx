import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Spinner from "../common/Spinner";

// Wraps any route that requires authentication
// allowedRoles: optional array — if provided, also checks role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Still checking localStorage / verifying token — show spinner
  if (loading) return <Spinner />;

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
