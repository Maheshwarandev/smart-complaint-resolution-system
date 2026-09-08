import React from "react";

const AttachmentList = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>
        <i className="ti ti-paperclip" style={{ color: "var(--brand)", fontSize: "16px" }} />
        <span>Attachments ({attachments.length})</span>
      </div>
      <div style={styles.attachmentList}>
        {attachments.map((att, i) => {
          const isFullUrl =
            att.filepath &&
            (att.filepath.startsWith("http://") || att.filepath.startsWith("https://"));
          const fileLink = isFullUrl
            ? att.filepath
            : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${att.filepath}`;

          return (
            <a
              key={i}
              href={fileLink}
              target="_blank"
              rel="noreferrer"
              style={styles.attachmentBtn}
            >
              <i className="ti ti-file" style={{ fontSize: "14px" }} />
              <span>{att.filename}</span>
              <i className="ti ti-external-link" style={{ fontSize: "12px", color: "var(--text-muted)" }} />
            </a>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid var(--border)",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  attachmentList: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  attachmentBtn: {
    background: "var(--bg-hover)",
    color: "var(--brand)",
    padding: "6px 10px",
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid var(--border)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "border-color 150ms ease",
  },
};

export default AttachmentList;
