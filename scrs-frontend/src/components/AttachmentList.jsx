import React from "react";

const AttachmentList = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  const s = styles;
  return (
    <div style={s.section}>
      <h4 style={s.sectionTitle}>📎 Attachments</h4>
      <div style={s.attachmentList}>
        {attachments.map((att, i) => {
          const isFullUrl = att.filepath && (att.filepath.startsWith("http://") || att.filepath.startsWith("https://"));
          const fileLink = isFullUrl ? att.filepath : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${att.filepath}`;
          return (
            <a
              key={i}
              href={fileLink}
              target="_blank"
              rel="noreferrer"
              style={s.attachmentBtn}
            >
              {att.filename}
            </a>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  section: { marginTop: "1.5rem", marginBottom: "1.5rem" },
  sectionTitle: { margin: "0 0 1rem", color: "var(--text-primary)", fontSize: "1rem", fontWeight: "700" },
  attachmentList: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" },
  attachmentBtn: { background: "rgba(56, 189, 248, 0.1)", color: "var(--accent-blue)", padding: "0.4rem 0.8rem", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: "500", border: "1px solid rgba(56, 189, 248, 0.2)", transition: "all 0.2s" }
};

export default AttachmentList;
