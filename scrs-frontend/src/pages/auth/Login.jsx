import { useState } from "react";
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { loginAPI } from "../../api/authAPI";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const { saveAuth, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // All hooks MUST be declared before any early returns (Rules of Hooks)
  const [showAgentCode, setShowAgentCode] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", agentSecurityCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(location.state?.message || "");

  // If already logged in, redirect to the correct dashboard immediately
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "agent") return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }



  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = {
        email: form.email,
        password: form.password,
      };

      // Include security code only if the agent field is shown and filled
      if (showAgentCode && form.agentSecurityCode) {
        loginData.agentSecurityCode = form.agentSecurityCode;
      }

      const res = await loginAPI(loginData);
      const userData = res.data.user;
      saveAuth(userData, res.data.token);

      // Redirect based on actual role returned from backend
      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "agent") {
        navigate("/agent/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to backend server. Please make sure backend is running on port 5000.");
      } else {
        setError(err.response?.data?.message || "Login failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const s = styles;

  return (
    <div className="auth-page-wrapper">
      <div className="glass-panel animate-slide-up" style={s.card}>
        <div style={s.logoContainer}>
          <span style={s.logoIcon}>🛡️</span>
        </div>
        <h2 style={s.title}>Welcome Back</h2>
        <p style={s.sub}>Sign in to your SCRS Portal</p>

        {success && <div style={s.success}>{success}</div>}
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ─── EMAIL FIELD ────────────────────────────────────────────────── */}
          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input
              className="input-field"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* ─── PASSWORD FIELD ─────────────────────────────────────────────── */}
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* ─── AGENT TOGGLE ───────────────────────────────────────────────── */}
          <div style={s.agentToggle}>
            <button
              type="button"
              style={s.toggleBtn}
              onClick={() => {
                setShowAgentCode(v => !v);
                setForm(f => ({ ...f, agentSecurityCode: "" }));
              }}
            >
              {showAgentCode ? "▲ Hide security field" : "▼ Logging in as Agent?"}
            </button>
          </div>

          {/* ─── AGENT SECURITY CODE FIELD ──────────────────────────────────── */}
          {showAgentCode && (
            <div style={s.field} className="animate-fade-in">
              <label style={s.label}>Agent Security Code</label>
              <input
                className="input-field"
                type="text"
                name="agentSecurityCode"
                value={form.agentSecurityCode}
                onChange={handleChange}
                placeholder="e.g., AB3XZ9"
                required
              />
              <p style={s.hint}>💡 Ask your administrator for your security code</p>
            </div>
          )}

          {/* ─── SUBMIT BUTTON ──────────────────────────────────────────────── */}
          <button className="btn-primary" style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* ─── REGISTRATION LINK ──────────────────────────────────────────── */}
        <p style={s.footer}>
          New user?{" "}
          <Link to="/register" style={s.link}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-app)",
    padding: "1rem",
  },
  card: {
    padding: "2.5rem",
    width: "100%",
    maxWidth: "450px",
    display: "flex",
    flexDirection: "column",
    textAlign: "center"
  },
  logoContainer: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem"
  },
  title: {
    margin: "0 0 0.25rem",
    color: "var(--text-primary)",
    fontSize: "1.65rem",
    fontWeight: "800",
  },
  sub: {
    margin: "0 0 1.75rem",
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
  },

  // Form field styles
  field: { 
    marginBottom: "1.25rem",
    textAlign: "left"
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    fontWeight: "600",
    letterSpacing: "0.02em"
  },
  hint: {
    marginTop: "0.4rem",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },

  // Agent toggle button
  agentToggle: { 
    marginBottom: "1.25rem",
    textAlign: "left"
  },
  toggleBtn: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-secondary)",
    fontSize: "0.82rem",
    padding: "0.4rem 0.9rem",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontFamily: "var(--font-heading)",
    fontWeight: "500",
    transition: "all 0.2s"
  },

  // Button and errors
  btn: {
    width: "100%",
    marginTop: "0.5rem",
  },
  error: {
    background: "rgba(244, 63, 94, 0.1)",
    color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.2)",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1.25rem",
    fontSize: "0.88rem",
    textAlign: "left"
  },
  success: {
    background: "rgba(52, 211, 153, 0.1)",
    color: "#34d399",
    border: "1px solid rgba(52, 211, 153, 0.2)",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1.25rem",
    fontSize: "0.88rem",
    textAlign: "left"
  },

  // Footer
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
  },
  link: {
    color: "var(--accent-blue)",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Login;
