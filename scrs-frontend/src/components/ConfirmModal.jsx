import React from "react";

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconWrap}>
          <i className="ti ti-alert-triangle" style={{ fontSize: "28px", color: "var(--urgent)" }} />
        </div>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button type="button" className="btn-ghost" onClick={onCancel} style={{ height: "34px" }}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} style={{ height: "34px", padding: "0 16px" }}>
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "var(--bg-elevated)",
    padding: "24px",
    borderRadius: "var(--radius-lg)",
    width: "90%",
    maxWidth: "400px",
    border: "1px solid var(--border-strong)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  },
  iconWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "12px",
  },
  message: {
    margin: 0,
    color: "var(--text-primary)",
    fontSize: "14px",
    textAlign: "center",
    lineHeight: "1.5",
    marginBottom: "20px",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
};

export default ConfirmModal;
