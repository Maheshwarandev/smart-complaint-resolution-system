import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { registerAPI } from "../../api";
import { useAuth } from "../../context";

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "agent") return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Calculate password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    const map = [
      { score: 0, label: "", color: "var(--border)" },
      { score: 1, label: "Weak", color: "var(--urgent)" },
      { score: 2, label: "Fair", color: "var(--open)" },
      { score: 3, label: "Good", color: "var(--brand)" },
      { score: 4, label: "Strong", color: "var(--resolved)" },
    ];
    return map[score];
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerAPI(form);
      navigate("/login", {
        state: { message: "Account created successfully! Please sign in with your credentials." },
      });
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to backend server. Please try again.");
      } else {
        setError(err.response?.data?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="auth-page">
      {/* LEFT BRAND PANEL */}
      <div style={styles.leftPanel} className="auth-brand">
        <div>
          <div style={styles.brandHeader}>
            <div style={styles.brandIcon}>
              <i className="ti ti-shield-check" style={{ fontSize: "28px", color: "var(--brand)" }} />
            </div>
            <div>
              <div style={styles.brandTitle}>SCRS</div>
              <div style={styles.brandSubtitle}>Enterprise Support Desk</div>
            </div>
          </div>

          <div style={styles.featureList}>
            {[
              { icon: "ti-ticket", text: "End-to-end complaint tracking" },
              { icon: "ti-clock-check", text: "SLA-based resolution timelines" },
              { icon: "ti-users", text: "Role-based team management" },
              { icon: "ti-chart-bar", text: "Real-time analytics dashboard" },
            ].map((f, i) => (
              <div key={i} style={styles.featureRow}>
                <i className={`ti ${f.icon}`} style={styles.featureIcon} />
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.quote}>
          "Used by teams to manage, track, and resolve complaints with full accountability."
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div style={styles.rightPanel} className="auth-form">
        <div style={styles.card}>
          <h1 style={styles.cardTitle}>Create your account</h1>
          <p style={styles.cardSub}>Join SCRS Enterprise to submit and track complaints.</p>

          {error && <div style={styles.alertError}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alex Turner"
                required
                style={{ height: "40px" }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Work Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@organisation.com"
                required
                style={{ height: "40px" }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                  style={{ height: "40px", paddingRight: "36px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex="-1"
                >
                  <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"} />
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        style={{
                          ...styles.strengthSegment,
                          background: seg <= strength.score ? strength.color : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Access Role</label>
              <select name="role" value={form.role} onChange={handleChange} style={{ height: "40px" }}>
                <option value="user">User (Standard Ticket Submitter)</option>
                <option value="agent">Support Agent (Queue Resolver)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", height: "42px", fontSize: "14px", marginTop: "8px" }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--brand)", fontWeight: 500 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    background: "var(--bg-base)",
  },
  leftPanel: {
    width: "38%",
    background: "var(--bg-surface)",
    borderRight: "1px solid var(--border)",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "48px",
  },
  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "var(--radius-lg)",
    background: "var(--brand-subtle)",
    border: "1px solid var(--brand-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  brandSubtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  featureIcon: {
    fontSize: "18px",
    color: "var(--brand)",
    width: "20px",
  },
  featureText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  quote: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontStyle: "italic",
    lineHeight: "1.6",
  },
  rightPanel: {
    width: "62%",
    background: "var(--bg-base)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    boxSizing: "border-box",
  },
  card: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-xl)",
    padding: "36px 32px",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: "0 0 4px",
  },
  cardSub: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: "0 0 24px",
  },
  alertError: {
    background: "var(--urgent-bg)",
    color: "var(--urgent)",
    border: "1px solid rgba(224, 36, 36, 0.3)",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    fontSize: "12px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    marginBottom: "6px",
  },
  passwordWrap: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  strengthContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
  },
  strengthBars: {
    display: "flex",
    gap: "4px",
    flex: 1,
  },
  strengthSegment: {
    height: "3px",
    flex: 1,
    borderRadius: "2px",
    transition: "background 150ms ease",
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginTop: "20px",
    marginBottom: 0,
  },
};

export default Register;
