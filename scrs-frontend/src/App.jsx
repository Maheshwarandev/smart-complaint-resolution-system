import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ROLES } from "./constants";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import useAuth from "./hooks/useAuth";

// Auth Pages
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import Dashboard       from "./pages/user/Dashboard";
import MyComplaints    from "./pages/user/MyComplaints";
import SubmitComplaint from "./pages/user/SubmitComplaint";

// Agent Pages
import AgentDashboard   from "./pages/agent/AgentDashboard";
import AgentComplaints  from "./pages/agent/AgentComplaints";

// Admin Pages
import AdminDashboard    from "./pages/admin/AdminDashboard";
import ManageUsers       from "./pages/admin/ManageUsers";
import ManageAgents      from "./pages/admin/ManageAgents";
import ManageComplaints  from "./pages/admin/ManageComplaints";

// Redirects to the correct dashboard based on the logged-in user's role
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)                    return <Navigate to="/login"           replace />;
  if (user.role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (user.role === ROLES.AGENT) return <Navigate to="/agent/dashboard" replace />;
  return                               <Navigate to="/dashboard"        replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

          {/* ── Public Routes ───────────────────────────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Authenticated Routes with MainLayout ──────────────────────── */}
          <Route element={<MainLayout />}>
            {/* ── User Routes (role='user' only) ─────────────────────────── */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={[ROLES.USER]}><Dashboard /></ProtectedRoute>
            } />
            <Route path="/complaints" element={
              <ProtectedRoute allowedRoles={[ROLES.USER]}><MyComplaints /></ProtectedRoute>
            } />
            <Route path="/complaints/new" element={
              <ProtectedRoute allowedRoles={[ROLES.USER]}><SubmitComplaint /></ProtectedRoute>
            } />

            {/* ── Agent Routes ──────────────────────────────────────────── */}
            <Route path="/agent/dashboard" element={
              <ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentDashboard /></ProtectedRoute>
            } />
            <Route path="/agent/complaints" element={
              <ProtectedRoute allowedRoles={[ROLES.AGENT]}><AgentComplaints /></ProtectedRoute>
            } />

            {/* ── Admin Routes ──────────────────────────────────────────── */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ManageUsers /></ProtectedRoute>
            } />
            <Route path="/admin/agents" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ManageAgents /></ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ManageComplaints /></ProtectedRoute>
            } />

            {/* ── Legacy Admin Route (backward compatibility) ───────────── */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
            } />
          </Route>

          {/* ── Default Redirects ───────────────────────────────────────────── */}
          <Route path="/"  element={<RoleRedirect />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
