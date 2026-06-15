import { useEffect, useState } from "react";
import { io }                   from "socket.io-client";
import { useNavigate }          from "react-router-dom";
import BriefList  from "../components/BriefList";
import ChatPanel  from "../components/ChatPanel";
import api from "../lib/api";
import { generateBriefPDF } from "../lib/generateBriefPDF";

const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
const statuses  = ["Recibido", "En Proceso", "Completado"];

const ProducerDashboard = () => {
  const [briefs, setBriefs]          = useState([]);
  const [selectedBrief, setSelected] = useState(null);
  const [notification, setNotif]     = useState("");
  const [isMobile, setIsMobile]      = useState(() => window.innerWidth < 1024);
  const navigate                     = useNavigate();
  const user = { name: "Productor" };

  const loadBriefs = async () => {
    const { data } = await api.get("/briefs/producer");
    setBriefs(data);
    if (!selectedBrief && data[0]) setSelected(data[0]);
  };

  useEffect(() => {
    loadBriefs().catch(() => { setBriefs([]); });
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("qa_token");
    if (!token) return;
    const sock = io(socketUrl, { auth:{ token }, transports:["websocket"] });
    sock.on("brief:new",     b => { setBriefs(p => [b, ...p]); setNotif(`Nuevo brief: ${b.projectName}`); setTimeout(() => setNotif(""), 4500); });
    sock.on("brief:updated", b => { setBriefs(p => p.map(x => x.id === b.id ? b : x)); if (selectedBrief?.id === b.id) setSelected(b); });
    return () => sock.disconnect();
  }, [selectedBrief?.id]);

  const updateStatus = async (briefId, status) => {
    const { data } = await api.patch(`/briefs/${briefId}/status`, { status });
    setBriefs(p => p.map(x => x.id === data.id ? data : x));
    setSelected(data);
  };

  return (
    <div style={s.root}>
      <div style={{ ...s.shell, ...(isMobile ? s.shellMobile : {}) }}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside style={{ ...s.sidebar, ...(isMobile ? s.sidebarMobile : {}) }}>
          <div style={s.logoWrap}>
            <span style={s.logoText}>Andrade</span>
            <span style={s.logoCyan}>Estudio</span>
          </div>

          <nav style={{ flex: isMobile ? "none" : 1, paddingTop:"8px", width: isMobile ? "100%" : "auto" }}>
            <div style={s.navItem}>
              <div style={s.navDot} />
              Gestión de Briefs
            </div>
            <div
              style={s.navLink}
              onClick={() => navigate("/desarrollo-web")}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(0,188,212,0.07)"; e.currentTarget.style.color="#00bcd4"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(0,0,0,0.55)"; }}
            >
              <div style={s.navLinkDot} />
              Desarrollo Web
            </div>
          </nav>

          <div style={s.userTile}>
            <div style={s.userAvatar}>{(user?.name?.[0] || "P").toUpperCase()}</div>
            <div>
              <p style={s.userRole}>Productor</p>
              <p style={s.userName}>{user?.name}</p>
            </div>
          </div>

          <button style={{ ...s.logoutBtn, ...(isMobile ? s.logoutBtnMobile : {}) }}
            onClick={() => navigate("/cliente")}
            onMouseEnter={e => e.currentTarget.style.color = "#00bcd4"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.3)"}
          >
            Ir a Cliente
          </button>
        </aside>

        {/* ── Main ────────────────────────────────────────────── */}
        <main style={{ ...s.main, ...(isMobile ? s.mainMobile : {}) }}>
          <header style={{ ...s.pageHeader, ...(isMobile ? s.pageHeaderMobile : {}) }}>
            <div>
              <h1 style={{ ...s.pageTitle, ...(isMobile ? s.pageTitleMobile : {}) }}>Consola de <span style={{ color:"#00bcd4" }}>Producción</span></h1>
              <p style={s.pageSubtitle}>Supervisa y coordina entregas multimedia.</p>
            </div>
            {notification && (
              <div style={s.toast} className="pulse-cyan">{notification}</div>
            )}
          </header>

          <div style={{ ...s.grid, ...(isMobile ? s.gridMobile : {}) }}>
            {/* Inbox */}
            <section style={{ ...s.card, gridColumn: isMobile ? "span 12" : "span 5", display:"flex", flexDirection:"column", maxHeight: isMobile ? "none" : "calc(100vh - 160px)" }}>
              <CardHeader title="Bandeja de Entrada" sub="Proyectos de clientes" />
              <div style={{ flex:1, padding:"1rem", overflowY:"auto" }}>
                <BriefList
                  briefs={briefs}
                  selectedId={selectedBrief?.id}
                  onSelect={setSelected}
                  renderActions={brief => (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"10px" }}>
                      {statuses.map(status => (
                        <button key={status}
                          onClick={() => updateStatus(brief.id, status).catch(() => null)}
                          style={{
                            ...s.statusBtn,
                            ...(brief.status === status ? s.statusBtnActive : {}),
                          }}
                          onMouseEnter={e => { if(brief.status !== status) { e.currentTarget.style.borderColor="#00bcd4"; e.currentTarget.style.color="#00bcd4"; }}}
                          onMouseLeave={e => { if(brief.status !== status) { e.currentTarget.style.borderColor="rgba(0,0,0,0.1)"; e.currentTarget.style.color="rgba(0,0,0,0.45)"; }}}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            </section>

            {/* Chat */}
            <section style={{ ...s.card, gridColumn: isMobile ? "span 12" : "span 7", display:"flex", flexDirection:"column", maxHeight: isMobile ? "none" : "calc(100vh - 160px)" }}>
              <div style={{
                padding: isMobile ? "1rem" : "1.25rem 1.75rem", borderBottom:"1px solid rgba(0,0,0,0.06)",
                background:"rgba(0,0,0,0.015)", flexShrink:0,
                display:"flex", alignItems: isMobile ? "flex-start" : "center", justifyContent:"space-between",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "0.75rem" : 0,
              }}>
                <div>
                  <h3 style={{ fontSize:"14px", fontWeight:600, color:"#000", margin:0 }}>Comunicación Directa</h3>
                  <p style={{ fontSize:"10px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
                    color:"rgba(0,0,0,0.35)", marginTop:"3px" }}>
                    {selectedBrief ? `Proyecto: ${selectedBrief.projectName}` : "Selecciona un brief"}
                  </p>
                </div>
                {selectedBrief && (
                  <button
                    onClick={() => generateBriefPDF(selectedBrief)}
                    style={s.pdfBtn}
                    onMouseEnter={e => { e.currentTarget.style.background="#00bcd4"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="#00bcd4"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#00bcd4"; e.currentTarget.style.borderColor="rgba(0,188,212,0.4)"; }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width:"13px", height:"13px" }} fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round"/>
                      <polyline points="9 15 12 18 15 15" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Descargar PDF
                  </button>
                )}
              </div>
              <div style={{ flex:1, padding: isMobile ? "1rem" : "2rem", overflow:"hidden", minHeight: isMobile ? "320px" : "auto" }}>
                <ChatPanel briefId={selectedBrief?.id} user={user} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

const CardHeader = ({ title, sub }) => (
  <div style={{
    padding:"1.25rem 1.75rem", borderBottom:"1px solid rgba(0,0,0,0.06)",
    background:"rgba(0,0,0,0.015)", flexShrink:0,
  }}>
    <h3 style={{ fontSize:"14px", fontWeight:600, color:"#000", margin:0 }}>{title}</h3>
    <p style={{ fontSize:"10px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
      color:"rgba(0,0,0,0.35)", marginTop:"3px" }}>{sub}</p>
  </div>
);

const s = {
  root:{ minHeight:"100vh", background:"#f5f5f7", fontFamily:"'Inter', system-ui, sans-serif", color:"#000" },
  shell:{ display:"flex", height:"100vh", overflow:"hidden" },
  shellMobile:{ flexDirection:"column", height:"auto", overflow:"visible" },
  sidebar:{
    width:"240px", flexShrink:0, display:"flex", flexDirection:"column",
    padding:"1.5rem 1.1rem", margin:"1rem",
    background:"#ffffff",
    border:"1px solid rgba(0,188,212,0.28)",
    borderRadius:"18px",
    boxShadow:"0 2px 16px rgba(0,0,0,0.06)",
    gap:"1rem",
  },
  sidebarMobile:{
    width:"auto",
    margin:"0.75rem",
    padding:"1rem",
    borderRadius:"14px",
  },
  logoWrap:{
    fontSize:"18px", letterSpacing:"0.1em",
    paddingBottom:"1.25rem", borderBottom:"1px solid rgba(0,0,0,0.07)",
    fontFamily:"'Bebas Neue', sans-serif",
  },
  logoText:{ fontWeight:400, textTransform:"uppercase", color:"#000" },
  logoCyan:{ fontWeight:400, color:"#00bcd4" },
  navItem:{
    display:"flex", alignItems:"center", gap:"10px",
    padding:"10px 12px", borderRadius:"10px",
    background:"rgba(0,188,212,0.07)",
    border:"1px solid rgba(0,188,212,0.25)",
    color:"#00bcd4", fontSize:"13px", fontWeight:600,
  },
  navDot:{ width:"6px", height:"6px", borderRadius:"50%", background:"#00bcd4", flexShrink:0 },
  navLink:{
    display:"flex", alignItems:"center", gap:"10px",
    padding:"10px 12px", borderRadius:"10px", marginTop:"6px",
    background:"transparent", color:"rgba(0,0,0,0.55)",
    fontSize:"13px", fontWeight:600, cursor:"pointer", transition:"all 0.18s",
  },
  navLinkDot:{ width:"6px", height:"6px", borderRadius:"50%", background:"rgba(0,0,0,0.25)", flexShrink:0 },
  userTile:{
    display:"flex", alignItems:"center", gap:"10px",
    padding:"12px", borderRadius:"12px",
    background:"rgba(0,0,0,0.03)", border:"1px solid rgba(0,0,0,0.07)",
  },
  userAvatar:{
    width:"32px", height:"32px", borderRadius:"50%", flexShrink:0,
    background:"rgba(0,188,212,0.1)", border:"1px solid rgba(0,188,212,0.35)",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:"13px", fontWeight:700, color:"#00bcd4",
  },
  userRole:{ fontSize:"9px", fontWeight:600, letterSpacing:"0.14em",
    textTransform:"uppercase", color:"rgba(0,0,0,0.35)", margin:0 },
  userName:{ fontSize:"13px", fontWeight:600, color:"#000", margin:0, marginTop:"2px" },
  logoutBtn:{
    background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
    fontSize:"10px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
    color:"rgba(0,0,0,0.3)", padding:"6px 0", textAlign:"center", transition:"color 0.2s",
  },
  logoutBtnMobile:{ textAlign:"left" },
  main:{ flex:1, overflowY:"auto", padding:"1rem 1.5rem 1.5rem" },
  mainMobile:{ padding:"0.5rem 0.75rem 1rem" },
  pageHeader:{
    padding:"1rem 0 1.25rem", borderBottom:"1px solid rgba(0,0,0,0.08)", marginBottom:"1.5rem",
    display:"flex", alignItems:"center", justifyContent:"space-between",
  },
  pageHeaderMobile:{ alignItems:"flex-start", flexDirection:"column", gap:"0.75rem", marginBottom:"1rem" },
  pageTitle:{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"2rem", fontWeight:400, letterSpacing:"0.08em", margin:0, color:"#000" },
  pageTitleMobile:{ fontSize:"1.5rem", letterSpacing:"0.04em" },
  pageSubtitle:{ fontFamily:"'Inter', sans-serif", fontSize:"12px", color:"rgba(0,0,0,0.4)", marginTop:"3px" },
  toast:{
    padding:"7px 16px", borderRadius:"99px",
    background:"rgba(0,188,212,0.08)", border:"1px solid rgba(0,188,212,0.3)",
    color:"#00bcd4", fontSize:"11px", fontWeight:600, letterSpacing:"0.06em",
  },
  grid:{ display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:"1.25rem", alignItems:"start" },
  gridMobile:{ gridTemplateColumns:"repeat(1, 1fr)", gap:"1rem" },
  card:{
    background:"#ffffff", border:"1px solid rgba(0,188,212,0.2)",
    borderRadius:"18px", overflow:"hidden",
    boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
  },
  statusBtn:{
    padding:"4px 11px", borderRadius:"99px", cursor:"pointer", fontFamily:"inherit",
    fontSize:"9px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
    background:"transparent", color:"rgba(0,0,0,0.45)",
    border:"1px solid rgba(0,0,0,0.1)", transition:"all 0.18s",
  },
  statusBtnActive:{
    background:"#00bcd4", color:"#fff", border:"1px solid #00bcd4",
    boxShadow:"0 0 8px rgba(0,188,212,0.25)",
  },
  pdfBtn:{
    display:"flex", alignItems:"center", gap:"6px",
    padding:"7px 14px", borderRadius:"8px",
    background:"transparent", color:"#00bcd4",
    border:"1px solid rgba(0,188,212,0.4)",
    fontSize:"11px", fontWeight:600, letterSpacing:"0.06em",
    cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
    whiteSpace:"nowrap",
  },
};

export default ProducerDashboard;
