import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createComplaintAPI } from "../../api";
import { COMPLAINT_CATEGORY, COMPLAINT_PRIORITY } from "../../constants";

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: COMPLAINT_PRIORITY.MEDIUM,
  });

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter((f) =>
      /\.(jpg|jpeg|png|pdf)$/i.test(f.name)
    );
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("priority", form.priority);

    files.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      await createComplaintAPI(formData);
      setSuccess("Complaint submitted successfully! Redirecting to complaints...");
      setTimeout(() => navigate("/complaints"), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please check form fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Submit a complaint</h1>
        <p style={styles.subtitle}>
          Describe the issue clearly. Our team will respond within the SLA window.
        </p>
      </div>

      <div className="panel" style={{ padding: "28px" }}>
        {error && <div style={styles.alertError}>{error}</div>}
        {success && <div style={styles.alertSuccess}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Ticket Title */}
          <div style={styles.field}>
            <label style={styles.label}>Ticket Title</label>
            <div style={styles.helper}>A clear, specific one-line summary of the issue</div>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Server connectivity timeout in lab 3"
              minLength={5}
              required
              style={{ height: "40px" }}
            />
          </div>

          {/* Category & Priority in 2 Columns */}
          <div style={styles.twoCol}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                style={{ height: "40px" }}
              >
                <option value="">Select category...</option>
                {Object.values(COMPLAINT_CATEGORY).map((c) => {
                  const label = c === "hr" ? "HR" : c.charAt(0).toUpperCase() + c.slice(1);
                  return (
                    <option key={c} value={c}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={styles.label}>Priority Level</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={{ height: "40px" }}
              >
                <option value={COMPLAINT_PRIORITY.LOW}>🟢 Low (72h SLA)</option>
                <option value={COMPLAINT_PRIORITY.MEDIUM}>🟡 Medium (48h SLA)</option>
                <option value={COMPLAINT_PRIORITY.HIGH}>🔴 High (24h SLA)</option>
                <option value={COMPLAINT_PRIORITY.CRITICAL}>🔥 Critical (4h SLA)</option>
              </select>
            </div>
          </div>

          {/* Detailed Description */}
          <div style={styles.field}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={styles.label}>Detailed Description</label>
              <span style={styles.charCount}>{form.description.length} / 1000</span>
            </div>
            <div style={styles.helper}>
              Include what happened, when it started, and any steps you've tried
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide complete details about the issue (min 10 characters)..."
              minLength={10}
              maxLength={1000}
              required
              style={{ minHeight: "140px" }}
            />
          </div>

          {/* Drag & Drop Attachments */}
          <div style={styles.field}>
            <label style={styles.label}>Attachments (Optional)</label>
            <div
              style={{
                ...styles.dropzone,
                borderColor: isDragging ? "var(--border-brand)" : "var(--border-strong)",
                background: isDragging ? "var(--brand-subtle)" : "transparent",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="ti ti-cloud-upload" style={{ fontSize: "32px", color: "var(--text-muted)", marginBottom: "6px" }} />
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                Drop files here or click to upload
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                PDF, PNG, JPG · Max 5MB total
              </div>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: "none" }}
              />
            </div>

            {/* Selected File Chips */}
            {files.length > 0 && (
              <div style={styles.fileChipsWrap}>
                {files.map((file, idx) => (
                  <div key={idx} style={styles.fileChip}>
                    <i className="ti ti-paperclip" style={{ fontSize: "12px", color: "var(--brand)" }} />
                    <span style={styles.fileChipName}>{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      style={styles.removeFileBtn}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div style={styles.actionRow}>
            <Link to="/complaints" className="btn-ghost" style={{ height: "38px" }}>
              ← Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ height: "38px", padding: "0 24px" }}
            >
              {loading ? "Submitting..." : "Submit Complaint →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "640px",
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
  alertError: {
    background: "var(--urgent-bg)",
    color: "var(--urgent)",
    border: "1px solid rgba(224, 36, 36, 0.3)",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    marginBottom: "16px",
  },
  alertSuccess: {
    background: "var(--resolved-bg)",
    color: "var(--resolved)",
    border: "1px solid rgba(14, 159, 110, 0.3)",
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "13px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  twoCol: {
    display: "flex",
    gap: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    marginBottom: "2px",
  },
  helper: {
    fontSize: "11px",
    color: "var(--text-muted)",
    marginBottom: "6px",
  },
  charCount: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
  },
  dropzone: {
    border: "2px dashed var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 150ms ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileChipsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  fileChip: {
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "4px 8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "var(--text-primary)",
  },
  fileChipName: {
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeFileBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "16px",
    lineHeight: 1,
    cursor: "pointer",
    padding: "0 2px",
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    paddingTop: "16px",
    borderTop: "1px solid var(--border)",
  },
};

export default SubmitComplaint;
