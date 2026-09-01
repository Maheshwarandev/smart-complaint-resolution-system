import React from "react";

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button style={styles.cancel} onClick={onCancel}>Cancel</button>
          <button style={styles.confirm} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "1.25rem", borderRadius: "10px", width: "90%", maxWidth: "420px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  message: { margin: 0, color: "#0f172a", fontSize: "1rem", marginBottom: "1rem" },
  actions: { display: "flex", justifyContent: "flex-end", gap: "0.5rem" },
  cancel: { padding: "0.4rem 0.8rem", background: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer" },
  confirm: { padding: "0.4rem 0.8rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
};

export default ConfirmModal;
