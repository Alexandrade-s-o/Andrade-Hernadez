const statusStyles = {
  Recibido:     { background:"rgba(0,188,212,0.08)",  color:"#007a8a", border:"1px solid rgba(0,188,212,0.3)" },
  "En Proceso": { background:"rgba(255,149,0,0.08)",  color:"#b36200", border:"1px solid rgba(255,149,0,0.3)" },
  Completado:   { background:"rgba(52,199,89,0.08)",  color:"#1a7a3a", border:"1px solid rgba(52,199,89,0.3)" },
};

const StatusBadge = ({ status }) => (
  <span style={{
    ...{
      display:"inline-flex", alignItems:"center",
      padding:"3px 9px", borderRadius:"99px",
      fontSize:"9px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
      whiteSpace:"nowrap",
      background:"rgba(0,0,0,0.05)", color:"rgba(0,0,0,0.4)",
      border:"1px solid rgba(0,0,0,0.12)",
    },
    ...(statusStyles[status] || {}),
  }}>
    {status || "—"}
  </span>
);

export default StatusBadge;
