import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { updateProfileAPI } from "../api/authAPI";

const Profile = () => {
  const { user, saveAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (password) {
        formData.append("password", password);
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await updateProfileAPI(formData);
      const updatedUser = res.data.data;
      
      const token = localStorage.getItem("token");
      saveAuth(updatedUser, token);

      setToast("Profile updated successfully!");
      setIsEditing(false);
      setPassword("");
      setTimeout(() => setToast(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page} className="animate-fade-in">
      <div style={s.header}>
        <h1 style={s.title}>👤 User Profile</h1>
        <p style={s.subtitle}>Manage your account details and credentials</p>
      </div>

      {toast && <div style={s.toast}>{toast}</div>}
      {error && <div style={s.error}>{error}</div>}

      <div style={s.card} className="glass-panel">
        <div style={s.profileHeader}>
          <div style={s.avatarContainer}>
            {previewUrl ? (
              <img src={previewUrl} alt={name} style={s.avatarImg} />
            ) : (
              <div style={s.avatarFallback}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
            )}
            {isEditing && (
              <label style={s.uploadLabel}>
                📷
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <div style={s.profileMeta}>
            <h2 style={s.name}>{user?.name}</h2>
            <div style={s.badge}>{user?.role}</div>
          </div>

          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setError("");
            }}
            style={s.editToggleBtn}
          >
            {isEditing ? "Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        {!isEditing ? (
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
        ) : (
          <form onSubmit={handleSubmit} style={s.editForm}>
            <div style={s.inputGroup}>
              <label style={s.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={s.input}
              />
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>New Password (leave blank to keep current)</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>Profile Picture (Upload to Cloudinary)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={s.fileInput}
              />
            </div>

            <div style={s.btnRow}>
              <button type="submit" disabled={loading} style={s.saveBtn}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
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
  toast: {
    background: "rgba(34, 197, 94, 0.15)",
    color: "#34d399",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "1rem",
    fontWeight: "600",
  },
  error: {
    background: "rgba(244, 63, 94, 0.15)",
    color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.25)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "1rem",
    fontWeight: "600",
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
    flexWrap: "wrap"
  },
  avatarContainer: {
    position: "relative",
    width: "80px",
    height: "80px",
  },
  avatarImg: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--accent-blue)",
    boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)"
  },
  avatarFallback: {
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
  uploadLabel: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "var(--accent-blue)",
    color: "#ffffff",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "0.85rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
  },
  profileMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    flex: 1
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
  editToggleBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
    padding: "0.5rem 1rem",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.85rem"
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
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem"
  },
  input: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none"
  },
  fileInput: {
    color: "var(--text-secondary)",
    fontSize: "0.88rem"
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1rem"
  },
  saveBtn: {
    background: "var(--grad-primary)",
    color: "#ffffff",
    border: "none",
    padding: "0.75rem 1.75rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.9rem",
    cursor: "pointer"
  }
};

export default Profile;
