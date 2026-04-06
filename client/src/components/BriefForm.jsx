import { useState } from "react";
import api from "../lib/api";

const deliverableOptions = ["Video publicitario","Edición para redes","Motion graphics","Diseño gráfico","Fotografía producto","Audio / locución"];
const platformOptions    = ["Instagram","TikTok","YouTube","Web","TV","Otro"];
const styleOptions       = ["Minimal","Cinemático","Corporativo","Urbano","Experimental"];

const BriefForm = ({ onCreated }) => {
  const [form, setForm]           = useState({ projectName:"", projectType:"Video", objective:"", audience:"", references:"", budget:"", priority:"Media", description:"", deadline:"" });
  const [deliverables, setDeliv]  = useState([]);
  const [platforms, setPlat]      = useState([]);
  const [styles, setStyles]       = useState([]);
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const toggle = (val, list, setList) =>
    setList(p => p.includes(val) ? p.filter(x => x !== val) : [...p, val]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const desc = [
        form.description.trim(), "",
        "Checklist:",
        `- Tipo: ${form.projectType}`,
        `- Objetivo: ${form.objective || "Sin especificar"}`,
        `- Audiencia: ${form.audience || "Sin especificar"}`,
        `- Entregables: ${deliverables.length ? deliverables.join(", ") : "Sin especificar"}`,
        `- Plataformas: ${platforms.length ? platforms.join(", ") : "Sin especificar"}`,
        `- Estilo: ${styles.length ? styles.join(", ") : "Sin especificar"}`,
        `- Referencias: ${form.references || "Sin referencias"}`,
        `- Presupuesto: ${form.budget || "No definido"}`,
        `- Prioridad: ${form.priority}`,
      ].join("\n");
      const payload = new FormData();
      payload.append("projectName", form.projectName);
      payload.append("description", desc);
      payload.append("deadline",    form.deadline);
      Array.from(files).forEach(f => payload.append("files", f));
      const { data } = await api.post("/briefs", payload, { headers:{ "Content-Type":"multipart/form-data" } });
      setForm({ projectName:"", projectType:"Video", objective:"", audience:"", references:"", budget:"", priority:"Media", description:"", deadline:"" });
      setDeliv([]); setPlat([]); setStyles([]); setFiles([]);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo enviar el brief.");
    } finally { setLoading(false); }
  };

  const onFocus = e => { e.target.style.borderColor="#00bcd4"; e.target.style.boxShadow="0 0 0 3px rgba(0,188,212,0.1)"; };
  const onBlur  = e => { e.target.style.borderColor="rgba(0,0,0,0.12)"; e.target.style.boxShadow="none"; };

  return (
    <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

      <Field label="Nombre del Proyecto">
        <input required value={form.projectName} placeholder="Nombre de la campaña o entrega..."
          onChange={e => setForm(p=>({...p, projectName:e.target.value}))}
          style={s.input} onFocus={onFocus} onBlur={onBlur} />
      </Field>

      <div style={s.row2}>
        <Field label="Tipo de Proyecto">
          <select value={form.projectType} onChange={e => setForm(p=>({...p, projectType:e.target.value}))}
            style={s.input} onFocus={onFocus} onBlur={onBlur}>
            {["Video","Diseño gráfico","Motion graphics","Branding","Contenido multiplataforma"].map(o =>
              <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Prioridad">
          <select value={form.priority} onChange={e => setForm(p=>({...p, priority:e.target.value}))}
            style={s.input} onFocus={onFocus} onBlur={onBlur}>
            {["Baja","Media","Alta"].map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <div style={s.row2}>
        <Field label="Objetivo">
          <input value={form.objective} placeholder="¿Qué buscas lograr?"
            onChange={e => setForm(p=>({...p, objective:e.target.value}))}
            style={s.input} onFocus={onFocus} onBlur={onBlur} />
        </Field>
        <Field label="Audiencia">
          <input value={form.audience} placeholder="¿A quién nos dirigimos?"
            onChange={e => setForm(p=>({...p, audience:e.target.value}))}
            style={s.input} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </div>

      <Field label="Entregables">
        <div style={s.checkGrid}>
          {deliverableOptions.map(item => (
            <label key={item} style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
              <input type="checkbox" checked={deliverables.includes(item)}
                onChange={() => toggle(item, deliverables, setDeliv)}
                style={{ accentColor:"#00bcd4", width:"14px", height:"14px" }} />
              <span style={{ fontSize:"12px", color: deliverables.includes(item) ? "#00bcd4" : "rgba(0,0,0,0.6)" }}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Plataformas">
        <div style={s.pillRow}>
          {platformOptions.map(item => <Pill key={item} label={item} active={platforms.includes(item)} onClick={() => toggle(item, platforms, setPlat)} />)}
        </div>
      </Field>

      <Field label="Estilo Visual">
        <div style={s.pillRow}>
          {styleOptions.map(item => <Pill key={item} label={item} active={styles.includes(item)} onClick={() => toggle(item, styles, setStyles)} />)}
        </div>
      </Field>

      <Field label="Concepto & Mensaje">
        <textarea required value={form.description} rows={4}
          onChange={e => setForm(p=>({...p, description:e.target.value}))}
          placeholder="Describe el concepto creativo, mensaje clave y necesidades especiales..."
          style={{ ...s.input, resize:"vertical", lineHeight:"1.6" }}
          onFocus={onFocus} onBlur={onBlur} />
      </Field>

      <div style={s.row2}>
        <Field label="Fecha de Entrega">
          <input required type="date" value={form.deadline}
            onChange={e => setForm(p=>({...p, deadline:e.target.value}))}
            style={s.input} onFocus={onFocus} onBlur={onBlur} />
        </Field>
        <Field label="Presupuesto (Opcional)">
          <input value={form.budget} placeholder="USD / moneda local"
            onChange={e => setForm(p=>({...p, budget:e.target.value}))}
            style={s.input} onFocus={onFocus} onBlur={onBlur} />
        </Field>
      </div>

      <Field label="Referencias & Archivos">
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          <input value={form.references} placeholder="Links de referencias (Behance, YouTube, Vimeo...)"
            onChange={e => setForm(p=>({...p, references:e.target.value}))}
            style={s.input} onFocus={onFocus} onBlur={onBlur} />
          <div style={{ position:"relative" }}>
            <input type="file" multiple onChange={e => setFiles(e.target.files)}
              style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", zIndex:2, width:"100%", height:"100%" }} />
            <div style={{
              border:"1px dashed rgba(0,0,0,0.15)", borderRadius:"12px",
              padding:"20px", textAlign:"center",
              background: files.length > 0 ? "rgba(0,188,212,0.04)" : "transparent",
            }}>
              <p style={{ fontSize:"11px", color:"rgba(0,0,0,0.38)", fontWeight:500 }}>
                {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : "Arrastra archivos o haz clic"}
              </p>
            </div>
          </div>
        </div>
      </Field>

      {error && (
        <div style={{ padding:"12px 14px", borderRadius:"10px", background:"rgba(255,59,48,0.06)", border:"1px solid rgba(255,59,48,0.2)", color:"#c0392b", fontSize:"12px", textAlign:"center" }}>
          {error}
        </div>
      )}

      <button disabled={loading} style={s.submitBtn}
        onMouseEnter={e => { if(!loading){ e.currentTarget.style.background="#00bcd4"; e.currentTarget.style.borderColor="#00bcd4"; }}}
        onMouseLeave={e => { e.currentTarget.style.background="#000"; e.currentTarget.style.borderColor="#000"; }}
      >
        {loading ? "Sincronizando con el estudio..." : "Enviar Propuesta de Brief"}
      </button>
    </form>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
    <label style={{ fontSize:"10px", fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(0,0,0,0.45)" }}>{label}</label>
    {children}
  </div>
);

const Pill = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} style={{
    padding:"5px 14px", borderRadius:"99px", cursor:"pointer", fontFamily:"inherit",
    fontSize:"10px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
    background: active ? "#00bcd4" : "transparent",
    color:       active ? "#fff"    : "rgba(0,0,0,0.5)",
    border:      active ? "1px solid #00bcd4" : "1px solid rgba(0,0,0,0.15)",
    transition:"all 0.2s",
  }}>
    {label}
  </button>
);

const s = {
  row2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" },
  input:{
    width:"100%", padding:"10px 13px", fontSize:"13px", fontFamily:"inherit",
    background:"#f5f5f7", border:"1px solid rgba(0,0,0,0.12)",
    borderRadius:"10px", color:"#000", outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s",
  },
  checkGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))", gap:"10px 14px" },
  pillRow:{ display:"flex", flexWrap:"wrap", gap:"8px" },
  submitBtn:{
    width:"100%", padding:"13px", borderRadius:"10px",
    background:"#000", color:"#fff", border:"1px solid #000",
    fontSize:"12px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
    cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
  },
};

export default BriefForm;
