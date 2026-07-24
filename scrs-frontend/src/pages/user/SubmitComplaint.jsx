import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaintAPI } from "../../api/complaintAPI";
import { COMPLAINT_CATEGORY, COMPLAINT_PRIORITY } from "../../constants";

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "", priority: COMPLAINT_PRIORITY.MEDIUM });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
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
      setSuccess("Complaint ticket created successfully! Redirecting...");
      setTimeout(() => navigate("/complaints"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page} className="animate-fade-in">
      <div style={s.header}>
        <h1 style={s.headerTitle}>⚡ Submit Service Ticket</h1>
        <p style={s.headerSub}>File a formal complaint or technical request with our support team</p>
      </div>

      <div className="glass-panel" style={s.card}>
        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data" style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Ticket Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Server connectivity timeout in lab 3"
              minLength={5}
              required
              style={s.input}
            />
          </div>

          <div style={s.rowTwo}>
            <div style={s.field}>
              <label style={s.label}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} required style={s.select}>
                <option value="" style={s.option}>Select category...</option>
                {Object.values(COMPLAINT_CATEGORY).map(c => {
                  const label = c === 'hr' ? 'HR' : c.charAt(0).toUpperCase() + c.slice(1);
                  return <option key={c} value={c} style={s.option}>{label}</option>;
                })}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Priority Level</label>
              <select name="priority" value={form.priority} onChange={handleChange} style={s.select}>
                {Object.values(COMPLAINT_PRIORITY).map(p => {
                  const label = p.charAt(0).toUpperCase() + p.slice(1);
                  return <option key={p} value={p} style={s.option}>{label}</option>;
                })}
              </select>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Detailed Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Provide complete details about the problem (min 10 characters)..."
              minLength={10}
              required
              style={s.textarea}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Attachments (Optional, max 5MB total)</label>
            <input
              type="file"
              name="attachments"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              style={s.fileInput}
            />
            {files.length > 0 && (
              <div style={s.filesBadge}>
                📎 {files.length} file(s) attached ({files.map(f => f.name).join(", ")})
              </div>
            )}
          </div>

          <div style={s.btnRow}>
            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? "Submitting Ticket..." : "Submit Complaint 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  page: {
    padding: "2rem 1rem",
    maxWidth: "750px",
    margin: "0 auto"
  },
  header: {
    marginBottom: "1.75rem"
  },
  headerTitle: {
    fontFamily: "var(--font-heading)",
    color: "var(--text-primary)",
    fontSize: "1.85rem",
    fontWeight: "800",
    margin: "0 0 0.35rem"
  },
  headerSub: {
    color: "var(--text-secondary)",
    fontSize: "0.92rem",
    margin: 0
  },
  card: {
    padding: "2.25rem",
    borderRadius: "20px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-md)"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem"
  },
  rowTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem"
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem"
  },
  label: {
    color: "var(--text-primary)",
    fontSize: "0.85rem",
    fontWeight: "600"
  },
  input: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "var(--text-primary)",
    fontSize: "0.92rem",
    outline: "none"
  },
  select: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "var(--text-primary)",
    fontSize: "0.92rem",
    outline: "none"
  },
  option: {
    background: "#0d1320",
    color: "#ffffff"
  },
  textarea: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "var(--text-primary)",
    fontSize: "0.92rem",
    outline: "none",
    height: "130px",
    resize: "vertical",
    fontFamily: "inherit"
  },
  fileInput: {
    color: "var(--text-secondary)",
    fontSize: "0.88rem"
  },
  filesBadge: {
    marginTop: "0.5rem",
    background: "rgba(56, 189, 248, 0.1)",
    color: "var(--accent-blue)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: "600"
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "0.5rem"
  },
  submitBtn: {
    background: "var(--grad-primary)",
    color: "#ffffff",
    border: "none",
    padding: "0.8rem 2rem",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(2, 132, 199, 0.25)"
  },
  error: {
    background: "rgba(244, 63, 94, 0.12)",
    color: "#f43f5e",
    border: "1px solid rgba(244, 63, 94, 0.25)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "1rem",
    fontSize: "0.88rem"
  },
  success: {
    background: "rgba(16, 185, 129, 0.12)",
    color: "#10b981",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "1rem",
    fontSize: "0.88rem"
  }
};

export default SubmitComplaint;
