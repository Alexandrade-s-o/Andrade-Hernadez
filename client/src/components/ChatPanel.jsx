import { useEffect, useMemo, useState } from "react";
import { io }  from "socket.io-client";
import api     from "../lib/api";

const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ChatPanel = ({ briefId, user }) => {
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState("");
  const [socket,   setSocket]   = useState(null);

  useEffect(() => {
    if (!briefId) return;
    let alive = true;
    api.get(`/briefs/${briefId}/messages`)
       .then(({ data }) => { if (alive) setMessages(data); })
       .catch(() => { if (alive) setMessages([]); });
    return () => { alive = false; };
  }, [briefId]);

  useEffect(() => {
    const token = localStorage.getItem("qa_token");
    if (!token || !briefId) return;
    const sock = io(socketUrl, { auth:{ token }, transports:["websocket"] });
    sock.on("connect", () => sock.emit("brief:join", { briefId }));
    sock.on("message:new", msg => {
      if (String(msg.brief) === String(briefId)) setMessages(p => [...p, msg]);
    });
    setSocket(sock);
    return () => sock.disconnect();
  }, [briefId]);

  const sorted = useMemo(
    () => [...messages].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages]
  );

  const send = () => {
    if (!socket || !text.trim() || !briefId) return;
    socket.emit("message:send", { briefId, text: text.trim() });
    setText("");
  };

  if (!briefId) return (
    <div style={s.empty}>
      <div style={s.emptyCircle} />
      <p style={s.emptyText}>Selecciona un proyecto para iniciar la comunicación</p>
    </div>
  );

  return (
    <section style={s.root}>
      <div style={s.feed}>
        {sorted.length === 0 && (
          <p style={{ textAlign:"center", fontSize:"10px", letterSpacing:"0.2em",
            textTransform:"uppercase", color:"rgba(0,0,0,0.28)", padding:"2rem 0" }}>
            Inicio de la conversación
          </p>
        )}
        {sorted.map((msg, i) => {
          const own = msg.sender?.id === user.id || msg.sender?._id === user.id;
          return (
            <div key={msg.id || i} style={{ display:"flex", flexDirection:"column", alignItems: own ? "flex-end" : "flex-start", gap:"4px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"0 4px" }}>
                <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:"rgba(0,0,0,0.35)" }}>
                  {own ? "Tú" : msg.sender?.name}
                </span>
                <span style={{ fontSize:"9px", color:"rgba(0,0,0,0.25)" }}>
                  {new Date(msg.createdAt).toLocaleTimeString("es-ES",{ hour:"2-digit", minute:"2-digit" })}
                </span>
              </div>
              <div style={{ ...s.bubble, ...(own ? s.bubbleOwn : s.bubbleOther) }}>
                <p style={{ fontSize:"13px", lineHeight:"1.55", margin:0 }}>{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <footer style={s.footer}>
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if(e.key === "Enter"){ e.preventDefault(); send(); }}}
          placeholder="Escribe un mensaje..."
          style={s.chatInput}
          onFocus={e => { e.target.style.borderColor="#00bcd4"; e.target.style.boxShadow="0 0 0 3px rgba(0,188,212,0.1)"; }}
          onBlur={e  => { e.target.style.borderColor="rgba(0,0,0,0.12)"; e.target.style.boxShadow="none"; }}
        />
        <button onClick={send} style={s.sendBtn}
          onMouseEnter={e => { e.currentTarget.style.background="#00bcd4"; e.currentTarget.style.borderColor="#00bcd4"; }}
          onMouseLeave={e => { e.currentTarget.style.background="#000"; e.currentTarget.style.borderColor="#000"; }}
        >
          <svg viewBox="0 0 24 24" style={{ width:"15px", height:"15px" }} fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </footer>
    </section>
  );
};

const s = {
  root:{ display:"flex", flexDirection:"column", height:"100%", minHeight:"360px", overflow:"hidden" },
  feed:{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"14px", paddingRight:"4px" },
  bubble:{
    maxWidth:"72%", padding:"10px 14px", borderRadius:"14px",
    fontSize:"13px", lineHeight:"1.55",
  },
  bubbleOwn:{
    background:"#000", color:"#fff",
    borderTopRightRadius:"4px",
  },
  bubbleOther:{
    background:"#f5f5f7", color:"#000",
    border:"1px solid rgba(0,0,0,0.08)",
    borderTopLeftRadius:"4px",
  },
  footer:{
    display:"flex", alignItems:"center", gap:"10px",
    paddingTop:"1rem", marginTop:"0.75rem",
    borderTop:"1px solid rgba(0,0,0,0.07)", flexShrink:0,
  },
  chatInput:{
    flex:1, padding:"10px 14px", fontSize:"13px",
    background:"#f5f5f7", border:"1px solid rgba(0,0,0,0.12)",
    borderRadius:"10px", color:"#000", outline:"none",
    fontFamily:"inherit", transition:"border-color 0.2s, box-shadow 0.2s",
  },
  sendBtn:{
    width:"38px", height:"38px", borderRadius:"50%", flexShrink:0,
    background:"#000", border:"1px solid #000", cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center",
    color:"#fff", transition:"background 0.2s, border-color 0.2s",
  },
  empty:{
    display:"flex", flexDirection:"column", alignItems:"center",
    justifyContent:"center", height:"100%", gap:"14px",
    color:"rgba(0,0,0,0.3)",
  },
  emptyCircle:{
    width:"40px", height:"40px", borderRadius:"50%",
    border:"1px dashed rgba(0,188,212,0.35)",
    background:"rgba(0,188,212,0.04)",
  },
  emptyText:{
    fontSize:"10px", fontWeight:600, letterSpacing:"0.18em",
    textTransform:"uppercase", textAlign:"center", maxWidth:"200px", lineHeight:"1.7",
    color:"rgba(0,0,0,0.35)",
  },
};

export default ChatPanel;
