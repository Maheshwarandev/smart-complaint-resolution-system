import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaintAPI } from "../../api/complaintAPI";
import { COMPLAINT_CATEGORY, COMPLAINT_PRIORITY } from "../../constants";

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ title: "", description: "", category: "", priority: COMPLAINT_PRIORITY.MEDIUM });
  const [files,   setFiles]   = useState([]);
  const [error,   setError]   = useState("");
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
      setSuccess("Complaint submitted successfully! Redirecting...");
      setTimeout(() => navigate("/complaints"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const s = styles;
  return (
    <div style={s.page} className="animate-fade-in">
      <div className="glass-panel" style={s.card}>
        <h2 style={s.title}>Submit a Complaint</h2>
        <p style={s.sub}>Fill in the details below and we'll get back to you</p>

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={s.field}>
            <label style={s.label}>Title</label>
            <input className="input-field" name="title" value={form.title}
              onChange={handleChange} placeholder="Brief summary of the issue"
              minLength={5} required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Category</label>
            <select className="input-field" name="category" value={form.category} onChange={handleChange} required>
              <option value="" style={s.option}>Select a category</option>
              {Object.values(COMPLAINT_CATEGORY).map(c => {
                const label = c === 'hr' ? 'HR' : c.charAt(0).toUpperCase() + c.slice(1);
                return <option key={c} value={c} style={s.option}>{label}</option>;
              })}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Priority</label>
            <select className="input-field" name="priority" value={form.priority} onChange={handleChange}>
              {Object.values(COMPLAINT_PRIORITY).map(p => {
                const label = p.charAt(0).toUpperCase() + p.slice(1);
                return <option key={p} value={p} style={s.option}>{label}</option>;
              })}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea className="input-field" style={{ height: "130px", resize: "vertical" }}
              name="description" value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail (min 10 characters)"
              minLength={10} required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Attachments (Optional, max 5MB total)</label>
            <input type="file" style={s.fileInput} name="attachments" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>Supported formats: JPG, PNG, PDF</p>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
            <button type="submit" className="btn-primary" style={s.btn} disabled={loading}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
            <button type="button" style={s.cancelBtn} onClick={() => navigate("/complaints")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page:      { padding: "2rem", maxWidth: "600px", margin: "0 auto" },
  card:      { padding: "2.25rem 2.5rem" },
  title:     { margin: "0 0 0.25rem", color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  sub:       { margin: "0 0 1.75rem", color: "var(--text-secondary)", fontSize: "0.95rem" },
  field:     { marginBottom: "1.25rem" },
  label:     { display: "block", marginBottom: "0.5rem", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: "600" },
  option:    { background: "var(--bg-sidebar)", color: "var(--text-primary)" },
  fileInput: { width: "100%", padding: "0.6rem", border: "1px dashed var(--border-subtle)", borderRadius: "8px", fontSize: "0.88rem", cursor: "pointer", background: "rgba(255,255,255,0.015)", color: "var(--text-secondary)" },
  btn:       { padding: "0.75rem 1.5rem", fontSize: "0.95rem" },
  cancelBtn: { padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.03)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", borderRadius: "10px", fontSize: "0.95rem", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" },
  error:     { background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
  success:   { background: "rgba(52, 211, 153, 0.1)", color: "#34d399", border: "1px solid rgba(52, 211, 153, 0.2)", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.88rem" },
};

export default SubmitComplaint;
