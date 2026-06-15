import { useNavigate } from "react-router-dom";

/* Ruta del portfolio servido como sitio estático (client/public/portfolio/).
   Con barra final para que los recursos relativos resuelvan bien y evitar
   el redirect de cleanUrls sobre el .html. */
const PORTFOLIO_URL = "/portfolio/";

const projects = [
  {
    title: "Pixel Portfolio — DEVBOY",
    tag: "React · Canvas · Web Audio",
    desc: "Portfolio interactivo con estética Game Boy: máquina de estados de pantallas, sprites en canvas, paletas configurables y efectos de sonido.",
    url: PORTFOLIO_URL,
  },
];

const WebDevPage = () => {
  const navigate = useNavigate();

  return (
    <div style={s.root}>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header style={s.topbar}>
        <div style={s.logoWrap}>
          <span style={s.logoText}>Andrade</span>
          <span style={s.logoCyan}>Estudio</span>
        </div>

        <div style={s.titleBlock}>
          <h1 style={s.pageTitle}>
            Desarrollo <span style={{ color: "#00bcd4" }}>Web</span>
          </h1>
          <p style={s.pageSubtitle}>Proyectos y experimentos interactivos</p>
        </div>

        <div style={s.topActions}>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={s.ghostBtn}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#00bcd4"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#00bcd4"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#00bcd4"; e.currentTarget.style.borderColor = "rgba(0,188,212,0.4)"; }}
          >
            Pantalla completa ↗
          </a>
          <button
            style={s.backBtn}
            onClick={() => navigate("/cliente")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00bcd4")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.4)")}
          >
            Volver
          </button>
        </div>
      </header>

      {/* ── Proyecto destacado embebido ─────────────────────── */}
      <main style={s.main}>
        <div style={s.meta}>
          <h2 style={s.projTitle}>{projects[0].title}</h2>
          <span style={s.projTag}>{projects[0].tag}</span>
        </div>
        <p style={s.projDesc}>{projects[0].desc}</p>

        <div style={s.frameCard}>
          <div style={s.frameBar}>
            <span style={{ ...s.dot, background: "#ff5f57" }} />
            <span style={{ ...s.dot, background: "#febc2e" }} />
            <span style={{ ...s.dot, background: "#28c840" }} />
            <span style={s.frameUrl}>{PORTFOLIO_URL}</span>
          </div>
          <iframe
            src={PORTFOLIO_URL}
            title="Pixel Portfolio — DEVBOY"
            style={s.iframe}
            allow="autoplay; fullscreen"
            loading="lazy"
          />
        </div>

        <p style={s.hint}>
          Usa las flechas / WASD y los botones A/B dentro de la consola. Toca el
          panel para sonido e interacción.
        </p>
      </main>
    </div>
  );
};

const s = {
  root: {
    minHeight: "100vh",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f5f5f7",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#000",
    overflow: "hidden",
  },
  topbar: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "0.9rem 1.5rem",
    background: "#ffffff",
    borderBottom: "1px solid rgba(0,188,212,0.2)",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
  },
  logoWrap: {
    fontSize: "18px",
    letterSpacing: "0.1em",
    fontFamily: "'Bebas Neue', sans-serif",
    flexShrink: 0,
  },
  logoText: { fontWeight: 400, textTransform: "uppercase", color: "#000" },
  logoCyan: { fontWeight: 400, color: "#00bcd4" },
  titleBlock: { textAlign: "center", flex: 1, minWidth: 0 },
  pageTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.9rem",
    fontWeight: 400,
    letterSpacing: "0.08em",
    margin: 0,
    color: "#000",
    lineHeight: 1,
  },
  pageSubtitle: {
    fontSize: "11px",
    color: "rgba(0,0,0,0.4)",
    marginTop: "3px",
    letterSpacing: "0.04em",
  },
  topActions: { display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: "8px",
    background: "transparent",
    color: "#00bcd4",
    border: "1px solid rgba(0,188,212,0.4)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "rgba(0,0,0,0.4)",
    transition: "color 0.2s",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "1.25rem 1.5rem",
    overflow: "hidden",
  },
  meta: { display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" },
  projTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "1.3rem",
    fontWeight: 400,
    letterSpacing: "0.06em",
    margin: 0,
    color: "#000",
  },
  projTag: {
    padding: "4px 11px",
    borderRadius: "99px",
    background: "rgba(0,188,212,0.08)",
    border: "1px solid rgba(0,188,212,0.3)",
    color: "#00bcd4",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  projDesc: {
    fontSize: "13px",
    color: "rgba(0,0,0,0.55)",
    margin: "6px 0 12px",
    maxWidth: "720px",
    lineHeight: 1.5,
  },
  frameCard: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#100f0c",
    boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
  },
  frameBar: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 14px",
    background: "#1d1c16",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  dot: { width: "11px", height: "11px", borderRadius: "50%", flexShrink: 0 },
  frameUrl: {
    marginLeft: "10px",
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    fontFamily: "monospace",
  },
  iframe: { flex: 1, width: "100%", border: "none", display: "block", background: "#100f0c" },
  hint: {
    flexShrink: 0,
    fontSize: "11px",
    color: "rgba(0,0,0,0.4)",
    marginTop: "10px",
    textAlign: "center",
  },
};

export default WebDevPage;
