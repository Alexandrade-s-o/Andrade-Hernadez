import StatusBadge from "./StatusBadge";

const BriefList = ({ briefs = [], selectedId, onSelect, renderActions }) => {
  const briefArray = Array.isArray(briefs) ? briefs : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
      {!briefArray.length && (
        <div style={{
          padding:"20px", borderRadius:"12px", textAlign:"center",
          background:"rgba(0,188,212,0.04)", border:"1px solid rgba(0,188,212,0.2)",
        }}>
          <p style={{ fontSize:"10px", letterSpacing:"0.18em", textTransform:"uppercase",
            color:"rgba(0,188,212,0.7)", fontWeight:600 }}>
            No hay proyectos activos
          </p>
        </div>
      )}

      {briefArray.map(brief => (
        <article key={brief.id} onClick={() => onSelect(brief)} style={{
          ...s.card,
          ...(selectedId === brief.id ? s.cardActive : {}),
        }}
          onMouseEnter={e => { if (selectedId !== brief.id) e.currentTarget.style.borderColor = "rgba(0,188,212,0.28)"; }}
          onMouseLeave={e => { if (selectedId !== brief.id) e.currentTarget.style.borderColor = "rgba(0,0,0,0.09)"; }}
        >
          {/* Cyan left accent when active */}
          {selectedId === brief.id && (
            <div style={{
              position:"absolute", top:0, left:0, bottom:0, width:"2px",
              background:"#00bcd4", borderRadius:"2px",
            }} />
          )}

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"10px", marginBottom:"6px" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h3 style={{
                fontSize:"13px", fontWeight:600,
                color: selectedId === brief.id ? "#00bcd4" : "#000",
                transition:"color 0.2s", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", margin:0,
              }}>
                {brief.projectName || "Sin título"}
              </h3>
              <p style={{ fontSize:"9px", fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase",
                color:"rgba(0,0,0,0.3)", marginTop:"2px" }}>
                ID: {brief.id.slice(0,8)}
              </p>
            </div>
            <StatusBadge status={brief.status} />
          </div>

          <p style={{ fontSize:"11px", lineHeight:"1.55", color:"rgba(0,0,0,0.45)",
            overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", marginBottom:"10px" }}>
            {brief.description || "Sin descripción proporcionada."}
          </p>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            paddingTop:"10px", borderTop:"1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"rgba(0,188,212,0.55)" }} />
              <span style={{ fontSize:"9px", fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase", color:"rgba(0,0,0,0.38)" }}>
                {brief.deadline ? new Date(brief.deadline).toLocaleDateString("es-ES",{ day:"numeric", month:"short" }) : "—"}
              </span>
            </div>
            {renderActions && (
              <div onClick={e => e.stopPropagation()}>{renderActions(brief)}</div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

const s = {
  card:{
    position:"relative", borderRadius:"14px", padding:"14px",
    background:"#ffffff", border:"1px solid rgba(0,0,0,0.09)",
    cursor:"pointer", overflow:"hidden",
    transition:"border-color 0.2s, box-shadow 0.2s",
    boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
  },
  cardActive:{
    background:"rgba(0,188,212,0.03)",
    border:"1px solid rgba(0,188,212,0.35)",
    boxShadow:"0 0 0 1px rgba(0,188,212,0.15)",
  },
};

export default BriefList;
