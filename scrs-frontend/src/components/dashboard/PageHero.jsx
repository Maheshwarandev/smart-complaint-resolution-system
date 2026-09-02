import { Link } from "react-router-dom";

/**
 * Reusable hero banner for dashboard pages.
 * @param {object} props
 * @param {string} props.name - User's display name
 * @param {string} props.email - User's email
 * @param {string} props.role - User role label (e.g., "Admin Portal")
 * @param {string} props.accentColor - CSS color for role accent
 * @param {string} props.badgeText - Status badge text
 * @param {string} props.actionLabel - CTA button label
 * @param {string} props.actionTo - CTA link destination
 */
const PageHero = ({
  name,
  email,
  role,
  accentColor = "#38bdf8",
  badgeText = "System Active",
  actionLabel,
  actionTo,
}) => {
  const initials = name?.[0]?.toUpperCase() || "U";

  return (
    <div style={{ ...s.hero, borderColor: `${accentColor}33` }}>
      <div style={s.heroLeft}>
        <div style={{ ...s.avatar, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
          {initials}
        </div>
        <div>
          <p style={{ ...s.heroRole, color: accentColor }}>{role}</p>
          <h1 style={s.heroName}>{name}</h1>
          {email && <p style={s.heroSub}>{email}</p>}
        </div>
      </div>
      <div style={s.heroRight}>
        <div style={s.heroBadge}>
          <span style={s.dot} />
          {badgeText}
        </div>
        {actionLabel && actionTo && (
          <Link to={actionTo} style={s.heroBtn} className="hover-lift">
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
};

const s = {
  hero: {
    borderRadius: "16px",
    padding: "2.25rem 2.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1.5rem",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--shadow-md)",
  },
  heroLeft: { display: "flex", alignItems: "center", gap: "1.25rem" },
  avatar: {
    width: "56px", height: "56px", borderRadius: "50%", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", fontWeight: "700", flexShrink: 0,
    boxShadow: "0 0 15px rgba(56, 189, 248, 0.25)",
    border: "2px solid rgba(255,255,255,0.15)",
    fontFamily: "var(--font-heading)",
  },
  heroRole: { margin: 0, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: "600" },
  heroName: { margin: "0.2rem 0", color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: "800" },
  heroSub: { margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" },
  heroRight: { display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" },
  heroBadge: {
    display: "flex", alignItems: "center", gap: "0.45rem",
    background: "rgba(52, 211, 153, 0.12)", color: "#34d399",
    padding: "0.45rem 1rem", borderRadius: "24px", fontSize: "0.85rem", fontWeight: "600",
    border: "1px solid rgba(52, 211, 153, 0.25)",
  },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%", background: "#34d399",
    display: "inline-block", boxShadow: "0 0 0 3px rgba(52, 211, 153, 0.25)",
  },
  heroBtn: {
    background: "#ffffff", color: "#0f172a", padding: "0.6rem 1.3rem",
    borderRadius: "10px", textDecoration: "none", fontWeight: "700", fontSize: "0.9rem",
    fontFamily: "var(--font-heading)", transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(255,255,255,0.1)",
  },
};

export default PageHero;
