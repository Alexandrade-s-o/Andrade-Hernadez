import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import BriefForm  from "../components/BriefForm";
import BriefList  from "../components/BriefList";
import ChatPanel  from "../components/ChatPanel";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const ClientDashboard = () => {
  const [briefs, setBriefs]          = useState([]);
  const [selectedBrief, setSelected] = useState(null);
  const { user, logout }             = useAuth();
  const navigate                     = useNavigate();

  const loadBriefs = async () => {
    const { data } = await api.get("/briefs/client");
    setBriefs(data);
    if (!selectedBrief && data[0]) setSelected(data[0]);
  };

  useEffect(() => {
    loadBriefs().catch(() => { logout(); navigate("/login"); });
  }, []);

  return (
    <div style={s.root}>
      <div style={s.shell}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside style={s.sidebar}>
          {/* Logo */}
          <div style={s.logoWrap}>
            <span style={s.logoText}>Andrade</span>
            <span style={s.logoCyan}>Estudio</span>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, paddingTop:"8px" }}>
            <div style={s.navItem}>
              <div style={s.navDot} />
              Proyectos
            </div>
          </nav>

          {/* User */}
          <div style={s.userTile}>
            <div style={s.userAvatar}>{(user?.name?.[0] || "U").toUpperCase()}</div>
            <div>
              <p style={s.userRole}>Cliente</p>
              <p style={s.userName}>{user?.name}</p>
            </div>
          </div>

          <button style={s.logoutBtn}
            onClick={() => { logout(); navigate("/login"); }}
            onMouseEnter={e => e.currentTarget.style.color = "#00bcd4"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.3)"}
          >
            Cerrar sesión
          </button>
        </aside>

        {/* ── Main ────────────────────────────────────────────── */}
        <main style={s.main}>
          {/* Page header */}
          <header style={s.pageHeader}>
            <div>
              <h1 style={s.pageTitle}>Panel de <span style={{ color:"#00bcd4" }}>Control</span></h1>
              <p style={s.pageSubtitle}>Gestiona tus proyectos multimedia.</p>
            </div>
          </header>

          {/* Content grid */}
          <div style={s.grid}>
            {/* Left */}
            <div style={{ gridColumn:"span 8", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
              <section style={s.card}>
                <CardHeader title="Nuevo Brief" sub="Completa los detalles de tu proyecto" />
                <div style={{ padding:"2rem" }}>
                  <BriefForm onCreated={b => { setBriefs(p => [b, ...p]); setSelected(b); }} />
                </div>
              </section>

              {selectedBrief && (
                <section style={s.card}>
                  <CardHeader
                    title="Comunicación Directa"
                    sub={`Proyecto: ${selectedBrief.projectName || selectedBrief.id}`}
                  />
                  <div style={{ padding:"2rem", minHeight:"400px" }}>
                    <ChatPanel briefId={selectedBrief?.id} user={user} />
                  </div>
                </section>
              )}
            </div>

            {/* Right */}
            <div style={{ gridColumn:"span 4" }}>
              <section style={{ ...s.card, display:"flex", flexDirection:"column" }}>
                <CardHeader title="Mis Briefs" sub="Historial de envíos" />
                <div style={{ flex:1, padding:"1rem", overflowY:"auto" }}>
                  <BriefList briefs={briefs} selectedId={selectedBrief?.id} onSelect={setSelected} />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const CardHeader = ({ title, sub }) => (
  <div style={{
    padding:"1.25rem 1.75rem", borderBottom:"1px solid rgba(0,0,0,0.06)",
    background:"rgba(0,0,0,0.015)",
  }}>
    <h3 style={{ fontSize:"14px", fontWeight:600, color:"#000", margin:0 }}>{title}</h3>
    <p style={{ fontSize:"10px", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
      color:"rgba(0,0,0,0.35)", marginTop:"3px" }}>{sub}</p>
  </div>
);

const s = {
  root:{ minHeight:"100vh", background:"#f5f5f7", fontFamily:"'Inter', system-ui, sans-serif", color:"#000" },
  shell:{ display:"flex", height:"100vh", overflow:"hidden" },
  sidebar:{
    width:"240px", flexShrink:0, display:"flex", flexDirection:"column",
    padding:"1.5rem 1.1rem", margin:"1rem",
    background:"#ffffff",
    border:"1px solid rgba(0,188,212,0.28)",
    borderRadius:"18px",
    boxShadow:"0 2px 16px rgba(0,0,0,0.06)",
    gap:"1rem",
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
  main:{ flex:1, overflowY:"auto", padding:"1rem 1.5rem 1.5rem" },
  pageHeader:{
    padding:"1rem 0 1.25rem", borderBottom:"1px solid rgba(0,0,0,0.08)", marginBottom:"1.5rem",
  },
  pageTitle:{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"2rem", fontWeight:400, letterSpacing:"0.08em", margin:0, color:"#000" },
  pageSubtitle:{ fontFamily:"'Inter', sans-serif", fontSize:"12px", color:"rgba(0,0,0,0.4)", marginTop:"3px" },
  grid:{ display:"grid", gridTemplateColumns:"repeat(12, 1fr)", gap:"1.25rem", alignItems:"start" },
  card:{
    background:"#ffffff", border:"1px solid rgba(0,188,212,0.2)",
    borderRadius:"18px", overflow:"hidden",
    boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
  },
};

export default ClientDashboard;
