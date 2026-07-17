import useAuth from "../hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={s.page} className="animate-fade-in">
      <div style={s.header}>
        <h1 style={s.title}>👤 User Profile</h1>
        <p style={s.subtitle}>Manage your account details and credentials</p>
      </div>

      <div style={s.card} className="glass-panel">
        <div style={s.profileHeader}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div style={s.profileMeta}>
            <h2 style={s.name}>{user?.name}</h2>
            <div style={s.badge}>{user?.role}</div>
          </div>
        </div>

        <div style={s.infoGrid} className="profile-info-grid">
          <div style={s.infoItem}>
            <span style={s.label}>Full Name</span>
            <span style={s.value}>{user?.name}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.label}>Email Address</span>
            <span style={s.value}>{user?.email}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.label}>Account Role</span>
            <span style={{ ...s.value, textTransform: "capitalize" }}>{user?.role}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.label}>System Access Status</span>
            <span style={s.statusValue}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    padding: "1rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontFamily: "var(--font-heading)",
    color: "var(--text-primary)",
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
  },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
  },
  card: {
    padding: "2.5rem",
    borderRadius: "20px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-md)",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "2.5rem",
    borderBottom: "1px solid var(--border-subtle)",
    paddingBottom: "1.5rem",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "var(--grad-primary)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "800",
    boxShadow: "0 0 20px rgba(14, 165, 233, 0.25)",
  },
  profileMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  name: {
    color: "var(--text-primary)",
    fontSize: "1.5rem",
    fontWeight: "700",
    fontFamily: "var(--font-heading)",
    margin: 0,
  },
  badge: {
    alignSelf: "flex-start",
    background: "rgba(14, 165, 233, 0.1)",
    color: "var(--accent-blue)",
    border: "1px solid rgba(14, 165, 233, 0.2)",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  value: {
    color: "var(--text-primary)",
    fontSize: "1.05rem",
    fontWeight: "600",
  },
  statusValue: {
    color: "#22c55e",
    fontSize: "1.05rem",
    fontWeight: "600",
  },
};

// Add responsive mobile columns in the infoGrid for index.css
export default Profile;
