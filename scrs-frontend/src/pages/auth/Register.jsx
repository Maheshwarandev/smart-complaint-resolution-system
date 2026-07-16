import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { registerAPI } from "../../api/authAPI";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const { saveAuth, user } = useAuth();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

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
      const res = await registerAPI(form);
      // Registration successful - redirect to login page
      // User must log in with their credentials
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>Join the SCRS Portal today</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label: "Full Name",  name: "name",     type: "text",     placeholder: "Mahesh Kumar" },
            { label: "Email",      name: "email",    type: "email",    placeholder: "you@example.com" },
            { label: "Password",   name: "password", type: "password", placeholder: "Min 6 characters" },
          ].map(({ label, name, type, placeholder }) => (
            <div style={s.field} key={name}>
              <label style={s.label}>{label}</label>
              <input
                className="input-field"
                type={type} name={name}
                value={form[name]} onChange={handleChange}
                placeholder={placeholder}
                minLength={name === "password" ? 6 : undefined}
                required
              />
            </div>
          ))}

          {/* Password requirements info */}
          <div style={s.infoBox}>
            🔐 Password must be at least 6 characters
          </div>

          {/* Role is always 'user' on self-registration — agents are promoted by admin */}
          <div style={s.infoBox}>
            📝 You will be registered as a <strong>User</strong>.
          </div>

          <button className="btn-primary" style={s.btn} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page:    { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-app)", padding: "1rem" },
  card:    { padding: "2.5rem", width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", textAlign: "center" },
  logoContainer: { fontSize: "2.5rem", marginBottom: "0.5rem" },
  title:   { margin: "0 0 0.25rem", color: "var(--text-primary)", fontSize: "1.65rem", fontWeight: "800" },
  sub:     { margin: "0 0 1.75rem", color: "var(--text-secondary)", fontSize: "0.95rem" },
  field:   { marginBottom: "1.25rem", textAlign: "left" },
  label:   { display: "block", marginBottom: "0.5rem", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "600", letterSpacing: "0.02em" },
  infoBox: { background: "rgba(52, 211, 153, 0.06)", border: "1px solid rgba(52, 211, 153, 0.15)", color: "#34d399", padding: "0.75rem", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "1rem", textAlign: "center" },
  btn:     { width: "100%", marginTop: "0.5rem" },
  error:   { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.88rem", textAlign: "left" },
  footer:  { textAlign: "center", marginTop: "1.5rem", color: "var(--text-secondary)", fontSize: "0.88rem" },
  link:    { color: "var(--accent-blue)", fontWeight: "600", textDecoration: "none" },
};

export default Register;
