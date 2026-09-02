/**
 * Reusable stat card grid for dashboard pages.
 * @param {object} props
 * @param {Array<{label: string, value: number, accent: string}>} props.stats
 * @param {number} props.total - Used for progress bar calculation
 */
const StatStrip = ({ stats, total }) => {
  return (
    <div className="stat-strip-layout" style={s.grid}>
      {stats.map(({ label, value, accent }) => (
        <div key={label} style={s.statBox} className="glass-panel hover-lift">
          <p style={{ ...s.statNum, color: accent }}>{value}</p>
          <p style={s.statLabel}>{label}</p>
          <div style={s.statBar}>
            <div
              style={{
                ...s.statFill,
                width: total ? `${(value / total) * 100}%` : "0%",
                background: accent,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const s = {
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" },
  statBox: { padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  statNum: { fontSize: "2.1rem", fontWeight: "800", margin: 0, fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" },
  statLabel: { margin: "0.2rem 0 0.8rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.02em" },
  statBar: { height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" },
  statFill: { height: "100%", borderRadius: "4px", transition: "width 0.4s ease" },
};

export default StatStrip;
