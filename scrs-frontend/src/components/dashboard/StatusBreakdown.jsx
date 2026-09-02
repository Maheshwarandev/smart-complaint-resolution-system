import { STATUS_META } from "../../utils/statusMeta";

/**
 * Reusable status/category breakdown sidebar panel.
 * @param {object} props
 * @param {string} props.title - Panel heading
 * @param {Array<{_id: string, count: number}>} props.items - Aggregated data
 * @param {number} props.total - Total count for percentage calculation
 * @param {string[]} [props.barColors] - Custom colors for items
 */
const StatusBreakdown = ({ title, items, total, barColors }) => {
  return (
    <div style={s.card} className="glass-panel">
      <h3 style={s.title}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No data yet</p>
      ) : (
        items.map(({ _id, count }, i) => {
          const sm = STATUS_META[_id] || {};
          const barColor = barColors
            ? barColors[i % barColors.length]
            : sm.bar || "#94a3b8";
          const pct = total ? Math.round((count / total) * 100) : 0;

          return (
            <div key={_id} style={s.row}>
              <div style={s.label}>
                <span style={{ ...s.dot, background: barColor }} />
                <span style={s.name}>{_id}</span>
              </div>
              <div style={s.right}>
                <div style={s.track}>
                  <div style={{ ...s.fill, width: `${pct}%`, background: barColor }} />
                </div>
                <span style={s.count}>{count}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const s = {
  card: { padding: "1.5rem" },
  title: { margin: "0 0 1.25rem", color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: "800" },
  row: { marginBottom: "0.95rem" },
  label: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" },
  dot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  name: { fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" },
  right: { display: "flex", alignItems: "center", gap: "0.6rem" },
  track: { flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden" },
  fill: { height: "100%", borderRadius: "6px", transition: "width 0.4s ease" },
  count: { fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "700", minWidth: "18px", textAlign: "right" },
};

export default StatusBreakdown;
