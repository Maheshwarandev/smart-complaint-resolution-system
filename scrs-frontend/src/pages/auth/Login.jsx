import React, { useState } from "react";
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { loginAPI } from "../../api";
import { useAuth } from "../../context";

const Login = () => {
  const { saveAuth, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "", agentSecurityCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showAgentCode, setShowAgentCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(location.state?.message || "");

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "agent") return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const fillDemo = (email, password, isAgent = false) => {
    setShowAgentCode(isAgent);
    setForm({ email, password, agentSecurityCode: isAgent ? "AGENTCODE" : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = {
        email: form.email,
        password: form.password,
      };

      if (showAgentCode && form.agentSecurityCode) {
        loginData.agentSecurityCode = form.agentSecurityCode;
      }

      const res = await loginAPI(loginData);
      const userData = res.data.user;
      saveAuth(userData, res.data.token);

      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "agent") {
        navigate("/agent/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (!err.response) {
        setError("Cannot connect to backend server. Please make sure the API is active.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please check your credentials.");
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
          <h1 style={styles.cardTitle}>Sign in to your account</h1>
          <p style={styles.cardSub}>Welcome back. Enter your credentials below.</p>

          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
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
                  placeholder="••••••••"
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
            </div>

            {/* Agent security code toggle */}
            <div style={{ marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowAgentCode(!showAgentCode);
                  setForm((f) => ({ ...f, agentSecurityCode: "" }));
                }}
                style={styles.agentToggle}
              >
                {showAgentCode ? "▲ Hide Agent Security Code" : "▼ Logging in as a Support Agent?"}
              </button>
            </div>

            {showAgentCode && (
              <div style={styles.field}>
                <label style={styles.label}>Agent Security Passkey</label>
                <input
                  type="text"
                  name="agentSecurityCode"
                  value={form.agentSecurityCode}
                  onChange={handleChange}
                  placeholder="e.g., AGENTCODE"
                  style={{ height: "40px" }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", height: "42px", fontSize: "14px", marginTop: "8px" }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or quick demo</span>
          </div>

          <div style={styles.demoRow}>
            <button
              type="button"
              className="btn-ghost"
              style={styles.demoBtn}
              onClick={() => fillDemo("john@example.com", "userpassword123")}
            >
              <i className="ti ti-user" /> User
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={styles.demoBtn}
              onClick={() => fillDemo("alex@example.com", "agentpassword123", true)}
            >
              <i className="ti ti-headset" /> Agent
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={styles.demoBtn}
              onClick={() => fillDemo("admin@scrs.com", "adminpassword123")}
            >
              <i className="ti ti-shield" /> Admin
            </button>
          </div>

          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--brand)", fontWeight: 500 }}>
              Create one →
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
  alertSuccess: {
    background: "var(--resolved-bg)",
    color: "var(--resolved)",
    border: "1px solid rgba(14, 159, 110, 0.3)",
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
  agentToggle: {
    background: "transparent",
    border: "none",
    color: "var(--brand)",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
  },
  divider: {
    textAlign: "center",
    margin: "20px 0 16px",
    position: "relative",
    borderBottom: "1px solid var(--border)",
  },
  dividerText: {
    position: "relative",
    top: "8px",
    background: "var(--bg-elevated)",
    padding: "0 8px",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  demoRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  demoBtn: {
    flex: 1,
    height: "32px",
    fontSize: "12px",
    padding: "0 4px",
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: 0,
  },
};

export default Login;
