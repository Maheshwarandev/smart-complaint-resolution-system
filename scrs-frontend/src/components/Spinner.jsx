import { Loader2 } from "lucide-react";

const Spinner = ({ size = 32, text }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "3rem", gap: "0.75rem" }}>
    <Loader2 
      size={size} 
      color="#38bdf8" 
      style={{ animation: "spin 1s linear infinite" }} 
    />
    {text && (
      <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem", fontWeight: "500" }}>
        {text}
      </span>
    )}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Spinner;
