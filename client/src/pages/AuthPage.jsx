import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", email: "", password: "", role: "cliente" };

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload  = isRegister ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      login(data);
      navigate(data.user.role === "cliente" ? "/cliente" : "/productor", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Error de autenticación");
    } finally { setLoading(false); }
  };

  return (
    <main style={s.page}>
      <div style={s.wrapper} className="fade-up">

        {/* Logo strip */}
        <div style={s.logoArea}>
          <h1 style={s.logo}>
            Andrade<span style={{ color:"#00bcd4" }}>Estudio</span>
          </h1>
          <div style={s.logoDivider} />
        </div>

        {/* Card */}
        <div style={s.card}>
          {/* Top cyan line */}
          <div style={s.accentTop} />

          <p style={s.cardSubtitle}>
            {isRegister ? "Crea tu cuenta" : "Inicia sesión"}
          </p>

          <form onSubmit={submit} style={s.form}>
            {isRegister && (
              <InputField label="Nombre completo" type="text" value={form.name}
                onChange={v => setForm(p => ({...p, name:v}))} placeholder="Tu nombre" required />
            )}
            <InputField label="Correo electrónico" type="email" value={form.email}
              onChange={v => setForm(p => ({...p, email:v}))} placeholder="correo@example.com" required />
            <InputField label="Contraseña" type="password" value={form.password}
              onChange={v => setForm(p => ({...p, password:v}))} placeholder="••••••••" required />

            {isRegister && (
              <div style={s.fieldWrap}>
                <label style={s.label}>Rol</label>
                <select value={form.role} onChange={e => setForm(p => ({...p, role:e.target.value}))}
                  style={s.input}
                  onFocus={e => { e.target.style.borderColor="#00bcd4"; e.target.style.boxShadow="0 0 0 3px rgba(0,188,212,0.12)"; }}
                  onBlur={e  => { e.target.style.borderColor="rgba(0,0,0,0.12)"; e.target.style.boxShadow="none"; }}
                >
                  <option value="cliente">Soy Cliente</option>
                  <option value="productor">Soy Productor</option>
                </select>
              </div>
            )}

            {error && <div style={s.errorBox}>{error}</div>}

            <button disabled={loading} style={s.btnPrimary}
              onMouseEnter={e => { e.currentTarget.style.background="#00bcd4"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="#00bcd4"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#000"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="#000"; }}
            >
              {loading ? "Cargando..." : isRegister ? "Crear cuenta" : "Iniciar sesión"}
            </button>
          </form>

          <button onClick={() => { setIsRegister(p => !p); setError(""); }} style={s.btnLink}
            onMouseEnter={e => e.currentTarget.style.color = "#00bcd4"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(0,0,0,0.38)"}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>

        <p style={s.copyright}>© {new Date().getFullYear()} Andrade Estudio Multimedia</p>
      </div>
    </main>
  );
};

const InputField = ({ label, type, value, onChange, placeholder, required }) => (
  <div style={s.fieldWrap}>
    <label style={s.label}>{label}</label>
    <input type={type} value={value} placeholder={placeholder} required={required}
      onChange={e => onChange(e.target.value)} style={s.input}
      onFocus={e => { e.target.style.borderColor="#00bcd4"; e.target.style.boxShadow="0 0 0 3px rgba(0,188,212,0.12)"; }}
      onBlur={e  => { e.target.style.borderColor="rgba(0,0,0,0.12)"; e.target.style.boxShadow="none"; }}
    />
  </div>
);

const s = {
  page:{
    minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
    background:"#f5f5f7", padding:"1.5rem",
  },
  wrapper:{ width:"100%", maxWidth:"400px", display:"flex", flexDirection:"column", alignItems:"center", gap:"0" },
  logoArea:{ textAlign:"center", marginBottom:"2rem" },
  logo:{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"2.4rem", fontWeight:400, letterSpacing:"0.1em", textTransform:"uppercase", color:"#000", lineHeight:1 },
  logoDivider:{ width:"32px", height:"1px", background:"#00bcd4", margin:"12px auto 0", opacity:0.7 },
  card:{
    width:"100%", background:"#ffffff", borderRadius:"20px",
    border:"1px solid rgba(0,188,212,0.25)",
    boxShadow:"0 2px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,188,212,0.12)",
    padding:"2.25rem", position:"relative", overflow:"hidden",
  },
  accentTop:{
    position:"absolute", top:0, left:"25%", right:"25%", height:"2px",
    background:"linear-gradient(90deg, transparent, #00bcd4, transparent)",
    borderRadius:"0 0 2px 2px",
  },
  cardSubtitle:{
    fontSize:"11px", fontWeight:500, letterSpacing:"0.22em", textTransform:"uppercase",
    color:"rgba(0,0,0,0.38)", textAlign:"center", marginBottom:"1.75rem",
    fontFamily:"'Inter', sans-serif",
  },
  form:{ display:"flex", flexDirection:"column", gap:"1.1rem" },
  fieldWrap:{ display:"flex", flexDirection:"column", gap:"6px" },
  label:{ fontSize:"10px", fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(0,0,0,0.45)" },
  input:{
    width:"100%", padding:"11px 14px", fontSize:"13px", fontFamily:"inherit",
    background:"#f5f5f7", border:"1px solid rgba(0,0,0,0.12)",
    borderRadius:"10px", color:"#000", outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s",
  },
  errorBox:{
    padding:"10px 14px", borderRadius:"10px",
    background:"rgba(255,59,48,0.06)", border:"1px solid rgba(255,59,48,0.2)",
    color:"#c0392b", fontSize:"12px", textAlign:"center",
  },
  btnPrimary:{
    width:"100%", padding:"13px", marginTop:"6px", borderRadius:"10px",
    background:"#000", color:"#fff", border:"1px solid #000",
    fontSize:"12px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
    cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
  },
  btnLink:{
    background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
    fontSize:"11px", fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase",
    color:"rgba(0,0,0,0.38)", padding:"16px 0 0", display:"block", width:"100%", textAlign:"center",
    transition:"color 0.2s",
  },
  copyright:{
    marginTop:"2rem", fontSize:"10px", letterSpacing:"0.2em",
    textTransform:"uppercase", color:"rgba(0,0,0,0.25)", textAlign:"center",
  },
};

export default AuthPage;
