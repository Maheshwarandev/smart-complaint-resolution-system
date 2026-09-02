import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.iconWrap}>
          <AlertTriangle size={24} color="#f59e0b" />
        </div>
        <p style={s.message}>{message}</p>
        <div style={s.actions}>
          <button style={s.cancel} onClick={onCancel}>Cancel</button>
          <button style={s.confirm} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    animation: "fadeIn 0.2s ease-out"
  },
  modal: {
    background: "var(--bg-surface-solid, #0d1320)", padding: "1.75rem",
    borderRadius: "16px", width: "90%", maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    border: "1px solid var(--border-subtle)",
    animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  iconWrap: {
    display: "flex", justifyContent: "center", marginBottom: "1rem"
  },
  message: {
    margin: 0, color: "var(--text-primary)", fontSize: "1rem",
    textAlign: "center", lineHeight: "1.5", marginBottom: "1.5rem"
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: "0.6rem" },
  cancel: {
    padding: "0.5rem 1.1rem", background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border-subtle)", borderRadius: "8px",
    cursor: "pointer", color: "var(--text-secondary)", fontWeight: "600",
    fontSize: "0.88rem", fontFamily: "var(--font-heading)",
    transition: "all 0.15s ease"
  },
  confirm: {
    padding: "0.5rem 1.1rem", background: "var(--grad-danger)",
    color: "#fff", border: "none", borderRadius: "8px",
    cursor: "pointer", fontWeight: "600", fontSize: "0.88rem",
    fontFamily: "var(--font-heading)", transition: "all 0.15s ease"
  },
};

export default ConfirmModal;
