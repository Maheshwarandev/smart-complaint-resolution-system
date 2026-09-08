import React, { useState } from "react";
import { useAuth } from "../context";
import { updateProfileAPI } from "../api";

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
    <div style={styles.container}>
      {toast && (
        <div style={styles.toast}>
          <i className="ti ti-check" style={{ color: "var(--resolved)" }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Account Profile</h1>
        <p style={styles.subtitle}>Manage your account information and credentials</p>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      <div className="panel" style={{ padding: "28px" }}>
        {/* Top Profile Summary */}
        <div style={styles.profileTop}>
          {previewUrl ? (
            <img src={previewUrl} alt={name} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarCircle}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h2 style={styles.userName}>{user?.name}</h2>
            <div style={styles.userEmail}>{user?.email}</div>
            <div style={{ marginTop: "6px" }}>
              <span className="badge-status badge-progress" style={{ textTransform: "uppercase" }}>
                <span className="badge-dot" />
                <span>{user?.role}</span>
              </span>
            </div>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-ghost"
              style={{ height: "36px" }}
            >
              <i className="ti ti-edit" /> Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form or Read-only Display */}
        {isEditing ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Profile Picture (Cloudinary)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ padding: "6px 10px", height: "38px" }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ height: "40px" }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                style={{ height: "40px" }}
              />
            </div>

            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(user?.name || "");
                  setPassword("");
                  setPreviewUrl(user?.avatar || "");
                }}
                className="btn-ghost"
                style={{ height: "38px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ height: "38px" }}
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.readOnlyList}>
            <div style={styles.row}>
              <span style={styles.rowLabel}>Email Address</span>
              <span style={styles.rowVal}>{user?.email}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.rowLabel}>Account Role</span>
              <span style={{ ...styles.rowVal, textTransform: "capitalize" }}>{user?.role}</span>
            </div>
            <div style={{ ...styles.row, borderBottom: "none" }}>
              <span style={styles.rowLabel}>Member Since</span>
              <span style={styles.rowVal}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recent"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: "0 0 4px",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: 0,
  },
  toast: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderLeft: "4px solid var(--resolved)",
    borderRadius: "var(--radius-lg)",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-primary)",
    marginBottom: "16px",
  },
  alertError: {
    background: "var(--urgent-bg)",
    color: "var(--urgent)",
    border: "1px solid rgba(224, 36, 36, 0.3)",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    marginBottom: "16px",
  },
  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    paddingBottom: "24px",
    borderBottom: "1px solid var(--border)",
    flexWrap: "wrap",
  },
  avatarImg: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--border-brand)",
  },
  avatarCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "var(--brand-muted)",
    color: "#FFFFFF",
    fontSize: "24px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid var(--brand)",
  },
  userName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 2px",
  },
  userEmail: {
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    marginBottom: "6px",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "8px",
  },
  readOnlyList: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid var(--border)",
  },
  rowLabel: {
    fontSize: "13px",
    color: "var(--text-muted)",
  },
  rowVal: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-primary)",
  },
};

export default Profile;
