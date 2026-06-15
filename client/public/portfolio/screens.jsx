/* ============================================================
   SCREENS — title, menu, and all content screens.
   Consumes window globals from pixel-engine.jsx.
   ============================================================ */
const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ----------------------- CONTENT (placeholder — Alex edits) ----------------------- */
const DEV = {
  name: "ALEX ANDRADE",
  role: "FULL-STACK DEV",
  level: 27,
  klass: "CODE WIZARD",
  hp: "∞", mp: "COFFEE",
  bio: [
    "Hola! Soy Alex, dev full-stack desde la era del floppy.",
    "Construyo apps web rápidas y juegos pixelados los findes.",
    "Misión actual: shippear cosas bonitas que no se rompan.",
  ],
};

const PROJECTS = [
  { name: "PIXEL DUNGEON",  icon: "sword", year: "2025", tag: "WEB GAME",
    desc: "Roguelike por turnos en el navegador. Mapas generados, niebla de guerra y jefes pixelados.",
    tech: "REACT · CANVAS · TS" },
  { name: "TASKFORGE",      icon: "flag",  year: "2024", tag: "SAAS",
    desc: "Gestor de tareas para equipos con tableros en tiempo real y atajos de teclado por todos lados.",
    tech: "NEXT · POSTGRES · WS" },
  { name: "SYNTHWAVE API",  icon: "chip",  year: "2024", tag: "BACKEND",
    desc: "API de streaming de música chiptune. 200k req/día, sub-50ms, escrita para durar.",
    tech: "GO · REDIS · GRPC" },
  { name: "DEVQUEST",       icon: "star",  year: "2026", tag: "THIS SITE",
    desc: "El portfolio que estás jugando ahora mismo. Hecho con amor y demasiados beeps.",
    tech: "REACT · WEB AUDIO" },
];

const SKILLS = [
  { name: "JAVASCRIPT", lvl: 95 },
  { name: "TYPESCRIPT", lvl: 90 },
  { name: "REACT",      lvl: 92 },
  { name: "NODE / GO",  lvl: 80 },
  { name: "PYTHON",     lvl: 74 },
  { name: "SQL / DB",   lvl: 82 },
  { name: "PIXEL ART",  lvl: 65 },
];

const JOBS = [
  { role: "SENIOR DEV",  place: "NEXUS LABS",  years: "2023 — HOY",
    desc: "Lidero el frontend de la plataforma. Mentor de 3 devs. Bajé el bundle un 40%." },
  { role: "DEVELOPER",   place: "PIXELWORKS",  years: "2021 — 2023",
    desc: "Construí features de pago y dashboards en tiempo real para 50k usuarios." },
  { role: "JR DEVELOPER", place: "STARTUP CO", years: "2019 — 2021",
    desc: "Mi primer boss fight. Aprendí a shippear, romper prod y arreglarlo a las 2am." },
];

const POSTS = [
  { title: "POR QUÉ AMO LOS SHADERS CRT", date: "MAY 2026", tag: "DEVLOG" },
  { title: "UN ROGUELIKE EN 48 HORAS",     date: "FEB 2026", tag: "GAMEDEV" },
  { title: "TYPESCRIPT: 10 TRUCOS",        date: "DEC 2025", tag: "GUÍA" },
  { title: "EL ARTE DE LAS 4 TONALIDADES", date: "OCT 2025", tag: "PIXEL" },
];

const CONTACTS = [
  { label: "EMAIL",    value: "alex@andrade.dev", icon: "mail" },
  { label: "GITHUB",   value: "github.com/alexa",  icon: "chip" },
  { label: "LINKEDIN", value: "in/alexandrade",    icon: "flag" },
  { label: "ITCH.IO",  value: "alexa.itch.io",     icon: "star" },
];

/* ----------------------- shared layout ----------------------- */
function ScreenFrame({ title, iconName, children, hint, paletteKey }) {
  return (
    <div className="scr">
      <div className="scr-head">
        {iconName && <IconSprite grid={ICONS[iconName]} size={2} paletteKey={paletteKey} />}
        <span>{title}</span>
      </div>
      <div className="scr-body">{children}</div>
      <div className="scr-foot">{hint}</div>
    </div>
  );
}

/* ----------------------- TITLE SCREEN ----------------------- */
/* Walk the hero with the d-pad, then press START / A to enter. */
function TitleScreen({ onStart, paletteKey }) {
  const [x, setX] = useS(0);          // hero x offset within a lane
  const [walking, setWalking] = useS(false);
  const [facing, setFacing] = useS(1);
  const [blinkOn, setBlinkOn] = useS(true);
  const walkTO = useR(null);

  useE(() => {
    const id = setInterval(() => setBlinkOn(b => !b), 540);
    return () => clearInterval(id);
  }, []);

  const stopSoon = () => {
    clearTimeout(walkTO.current);
    walkTO.current = setTimeout(() => setWalking(false), 180);
  };

  useGBInput((a) => {
    if (a === "a" || a === "start") { SFX.start(); onStart(); return; }
    if (a === "left")  { setFacing(-1); setWalking(true); setX(v => Math.max(-150, v - 18)); SFX.blip(); stopSoon(); }
    if (a === "right") { setFacing(1);  setWalking(true); setX(v => Math.min(150, v + 18));  SFX.blip(); stopSoon(); }
  });

  return (
    <div className="scr title-scr">
      <div className="title-stars" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="tstar" style={{
            left: (i * 37 % 100) + "%", top: (i * 53 % 70) + "%",
            animationDelay: (i % 6) * 0.3 + "s",
          }} />
        ))}
      </div>

      <div className="title-logo">
        <div className="title-name">{DEV.name}</div>
        <div className="title-sub">— A DEVELOPER QUEST —</div>
      </div>

      <div className="title-stage">
        <div className="title-ground" />
        <div className="title-hero" style={{
          transform: `translateX(${x}px) scaleX(${facing})`,
        }}>
          <HeroSprite size={4} walking={walking} paletteKey={paletteKey} />
        </div>
      </div>

      <div className={"press-start" + (blinkOn ? " on" : "")}>
        ▶ PRESS START
      </div>
      <div className="title-tip">◀ ▶ CAMINA · Ⓐ EMPEZAR</div>
      <div className="title-copy">© 2026 ANDRADE SOFT</div>
    </div>
  );
}

/* ----------------------- MAIN MENU ----------------------- */
const MENU_ITEMS = [
  { id: "about",      label: "SOBRE MÍ",    icon: "heart" },
  { id: "projects",   label: "PROYECTOS",   icon: "sword" },
  { id: "skills",     label: "HABILIDADES", icon: "chip" },
  { id: "experience", label: "EXPERIENCIA", icon: "flag" },
  { id: "blog",       label: "BLOG",        icon: "book" },
  { id: "contact",    label: "CONTACTO",    icon: "mail" },
];

function MenuScreen({ onPick, onBack, paletteKey }) {
  const [sel, setSel] = useS(0);
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + MENU_ITEMS.length - 1) % MENU_ITEMS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % MENU_ITEMS.length); SFX.move(); }
    if (a === "a" || a === "start") { SFX.confirm(); onPick(MENU_ITEMS[sel].id); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <div className="scr menu-scr">
      <div className="menu-head">
        <div className="menu-title">{DEV.name}</div>
        <div className="menu-role">LVL {DEV.level} · {DEV.role}</div>
      </div>
      <div className="menu-list">
        {MENU_ITEMS.map((m, i) => (
          <div key={m.id} className={"menu-item" + (i === sel ? " sel" : "")}
               onClick={() => { setSel(i); SFX.confirm(); onPick(m.id); }}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}>
            <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
            <IconSprite grid={ICONS[m.icon]} size={2} paletteKey={paletteKey} />
            <span className="menu-label">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="scr-foot">▲▼ MOVER · Ⓐ ABRIR</div>
    </div>
  );
}

/* ----------------------- ABOUT ----------------------- */
function AboutScreen({ paletteKey, textSpeed, onBack }) {
  const full = DEV.bio.join(" ");
  const [out, done, skip] = useTypewriter(full, textSpeed, true, () => SFX.blip());
  useGBInput((a) => {
    if ((a === "a" || a === "down" || a === "right") && !done) { skip(); SFX.move(); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="SOBRE MÍ" iconName="heart" paletteKey={paletteKey}
      hint={done ? "Ⓑ VOLVER" : "Ⓐ SALTAR TEXTO"}>
      <div className="about-grid">
        <div className="about-card">
          <div className="about-portrait">
            <HeroSprite size={5} paletteKey={paletteKey} />
          </div>
          <div className="stat-rows">
            <div className="stat-row"><span>CLASS</span><b>{DEV.klass}</b></div>
            <div className="stat-row"><span>LVL</span><b>{DEV.level}</b></div>
            <div className="stat-row"><span>HP</span><b>{DEV.hp}</b></div>
            <div className="stat-row"><span>MP</span><b>{DEV.mp}</b></div>
          </div>
        </div>
        <div className="dialog-box">
          <div className="dialog-name">{DEV.name}</div>
          <p className="dialog-text">{out}<span className={"caret" + (done ? " hide" : "")}>▌</span></p>
          {done && <div className="dialog-next">▶</div>}
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- PROJECTS ----------------------- */
function ProjectsScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  const [open, setOpen] = useS(false);
  useGBInput((a) => {
    if (open) {
      if (a === "b") { setOpen(false); SFX.back(); }
      return;
    }
    if (a === "up")   { setSel(s => (s + PROJECTS.length - 1) % PROJECTS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % PROJECTS.length); SFX.move(); }
    if (a === "a")    { setOpen(true); SFX.confirm(); }
    if (a === "b")    { SFX.back(); onBack && onBack(); }
  });
  const p = PROJECTS[sel];
  return (
    <ScreenFrame title="PROYECTOS" iconName="sword" paletteKey={paletteKey}
      hint={open ? "Ⓑ CERRAR" : "▲▼ ELEGIR · Ⓐ VER · Ⓑ MENÚ"}>
      {!open ? (
        <div className="proj-list">
          {PROJECTS.map((pr, i) => (
            <div key={pr.name} className={"proj-row" + (i === sel ? " sel" : "")}
                 onClick={() => { setSel(i); setOpen(true); SFX.confirm(); }}
                 onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}>
              <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
              <IconSprite grid={ICONS[pr.icon]} size={2} paletteKey={paletteKey} />
              <span className="proj-name">{pr.name}</span>
              <span className="proj-year">{pr.year}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="proj-detail">
          <div className="proj-detail-head">
            <IconSprite grid={ICONS[p.icon]} size={3} paletteKey={paletteKey} />
            <div>
              <div className="proj-detail-name">{p.name}</div>
              <div className="proj-badge">{p.tag} · {p.year}</div>
            </div>
          </div>
          <p className="proj-desc">{p.desc}</p>
          <div className="proj-tech">‹ {p.tech} ›</div>
        </div>
      )}
    </ScreenFrame>
  );
}

/* ----------------------- SKILLS ----------------------- */
function SkillsScreen({ paletteKey, onBack }) {
  const [fill, setFill] = useS(false);
  useE(() => { const t = setTimeout(() => setFill(true), 120); return () => clearTimeout(t); }, []);
  useGBInput((a) => { if (a === "b") { SFX.back(); onBack && onBack(); } });
  return (
    <ScreenFrame title="HABILIDADES" iconName="chip" paletteKey={paletteKey} hint="Ⓑ VOLVER">
      <div className="skill-list">
        {SKILLS.map((s) => (
          <div key={s.name} className="skill-row">
            <span className="skill-name">{s.name}</span>
            <div className="skill-bar">
              <div className="skill-fill" style={{ width: fill ? s.lvl + "%" : "0%" }} />
              <div className="skill-ticks">
                {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- EXPERIENCE ----------------------- */
function ExperienceScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + JOBS.length - 1) % JOBS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % JOBS.length); SFX.move(); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="EXPERIENCIA" iconName="flag" paletteKey={paletteKey} hint="▲▼ NAVEGAR · Ⓑ VOLVER">
      <div className="quest-log">
        {JOBS.map((j, i) => (
          <div key={j.place} className={"quest" + (i === sel ? " sel" : "")}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}>
            <div className="quest-dot">{i === sel ? "◆" : "◇"}</div>
            <div className="quest-body">
              <div className="quest-top">
                <span className="quest-role">{j.role}</span>
                <span className="quest-years">{j.years}</span>
              </div>
              <div className="quest-place">@ {j.place}</div>
              {i === sel && <p className="quest-desc">{j.desc}</p>}
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- BLOG ----------------------- */
function BlogScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + POSTS.length - 1) % POSTS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % POSTS.length); SFX.move(); }
    if (a === "a")    { SFX.coin(); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="BLOG" iconName="book" paletteKey={paletteKey} hint="▲▼ LEER · Ⓑ VOLVER">
      <div className="blog-list">
        {POSTS.map((p, i) => (
          <div key={p.title} className={"blog-row" + (i === sel ? " sel" : "")}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}
               onClick={() => { setSel(i); SFX.coin(); }}>
            <div className="blog-top">
              <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
              <span className="blog-tag">[{p.tag}]</span>
              <span className="blog-date">{p.date}</span>
            </div>
            <div className="blog-title">{p.title}</div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- CONTACT ----------------------- */
function ContactScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  const [saved, setSaved] = useS(false);
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + CONTACTS.length - 1) % CONTACTS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % CONTACTS.length); SFX.move(); }
    if (a === "a")    { setSaved(true); SFX.coin(); setTimeout(() => setSaved(false), 1400); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="CONTACTO" iconName="mail" paletteKey={paletteKey} hint="▲▼ ELEGIR · Ⓐ COPIAR · Ⓑ VOLVER">
      <div className="contact-intro">¡GAME OVER? NO — APENAS EL PRINCIPIO.<br/>ELIGE UN PORTAL Y SALUDA:</div>
      <div className="contact-list">
        {CONTACTS.map((c, i) => (
          <div key={c.label} className={"contact-row" + (i === sel ? " sel" : "")}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}
               onClick={() => { setSel(i); setSaved(true); SFX.coin(); setTimeout(() => setSaved(false), 1400); }}>
            <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
            <IconSprite grid={ICONS[c.icon]} size={2} paletteKey={paletteKey} />
            <span className="contact-label">{c.label}</span>
            <span className="contact-value">{c.value}</span>
          </div>
        ))}
      </div>
      <div className={"save-toast" + (saved ? " show" : "")}>★ ¡COPIADO! ★</div>
    </ScreenFrame>
  );
}

Object.assign(window, {
  TitleScreen, MenuScreen, AboutScreen, ProjectsScreen,
  SkillsScreen, ExperienceScreen, BlogScreen, ContactScreen,
  MENU_ITEMS, DEV,
});
