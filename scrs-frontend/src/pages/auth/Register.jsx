import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { registerAPI } from "../../api/authAPI";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      await registerAPI(form);
      navigate("/login", { state: { message: "Registration successful! Please sign in." } });
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to backend server. Please make sure backend is running on port 5000.");
      } else {
        setError(err.response?.data?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const s = styles;
  return (
    <div style={s.page} className="auth-page-wrapper">
      <div style={s.card} className="glass-panel animate-slide-up">
        {/* Brand Header */}
        <div style={s.brandHeader}>
          <div style={s.logoIcon}>🛡️</div>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.sub}>Join the SCRS Enterprise Portal today</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Alex Harrison"
              required
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Work Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@company.com"
              required
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password (Min 6 characters)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={6}
              required
              style={s.input}
            />
          </div>

          <div style={s.infoPill}>
            <span>🛡️ Default Access Role: <strong>User</strong></span>
          </div>

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Creating Account..." : "Create Account 🚀"}
          </button>
        </form>

        <p style={s.footer}>
          Already registered?{" "}
          <Link to="/login" style={s.link}>
            Sign in to Portal
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
    padding: "1.5rem",
  },
  card: {
    padding: "2.75rem 2.5rem",
    width: "100%",
    maxWidth: "460px",
    borderRadius: "20px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-lg)",
  },
  brandHeader: {
    textAlign: "center",
    marginBottom: "1.75rem"
  },
  logoIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.75rem",
    marginBottom: "0.75rem",
    boxShadow: "0 0 20px rgba(56, 189, 248, 0.15)"
  },
  title: {
    margin: "0 0 0.25rem",
    color: "var(--text-primary)",
    fontSize: "1.65rem",
    fontWeight: "800",
    fontFamily: "var(--font-heading)"
  },
  sub: {
    margin: 0,
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  field: { 
    marginBottom: "1.25rem",
    textAlign: "left"
  },
  label: {
    display: "block",
    marginBottom: "0.45rem",
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "var(--text-primary)",
    fontSize: "0.92rem",
    outline: "none",
    fontFamily: "inherit"
  },
  infoPill: {
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    padding: "0.65rem 0.9rem",
    borderRadius: "10px",
    fontSize: "0.82rem",
    fontWeight: "600",
    marginBottom: "1.25rem",
    textAlign: "center"
  },
  btn: {
    width: "100%",
    background: "var(--grad-primary)",
    color: "#ffffff",
    border: "none",
    padding: "0.85rem 1.25rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(2, 132, 199, 0.25)",
    marginTop: "0.5rem"
  },
  error: {
    background: "rgba(244, 63, 94, 0.12)",
    color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.25)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "1.25rem",
    fontSize: "0.88rem",
    textAlign: "left"
  },
  footer: {
    textAlign: "center",
    marginTop: "1.75rem",
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
  },
  link: {
    color: "var(--accent-blue)",
    fontWeight: "700",
    textDecoration: "none",
  },
};

export default Register;
