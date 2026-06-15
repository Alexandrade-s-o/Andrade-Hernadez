/* ============================================================
   APP — Game Boy shell, screen state machine, input, tweaks.
   ============================================================ */
const { useState: uS, useEffect: uE, useRef: uR } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  "shell": "gris",
  "scanlines": true,
  "glow": true,
  "sound": true,
  "textSpeed": 26
}/*EDITMODE-END*/;

/* map a palette array back to its name (for sprite redraw key + label) */
function paletteName(arr) {
  const j = arr.join(",").toLowerCase();
  for (const k of PALETTE_KEYS) if (PALETTES[k].join(",").toLowerCase() === j) return k;
  return "custom";
}

/* ----------------------- on-screen control pad ----------------------- */
function press(action) { SFX.resume(); fireInput(action); }

function ControlPad() {
  const hold = uR(null);
  const start = (a) => {
    press(a);
    clearInterval(hold.current);
    // gentle auto-repeat for directions
    if (a === "up" || a === "down" || a === "left" || a === "right") {
      hold.current = setTimeout(() => {
        hold.current = setInterval(() => fireInput(a), 130);
      }, 320);
    }
  };
  const end = () => { clearTimeout(hold.current); clearInterval(hold.current); };

  const dirBtn = (a, cls, label) => (
    <button className={"dpad-btn " + cls} aria-label={label}
      onPointerDown={(e) => { e.preventDefault(); start(a); }}
      onPointerUp={end} onPointerLeave={end} onPointerCancel={end}>
      <span className="dpad-arrow" />
    </button>
  );

  return (
    <div className="gb-controls">
      <div className="gb-dpad">
        {dirBtn("up", "d-up", "Arriba")}
        {dirBtn("left", "d-left", "Izquierda")}
        <div className="dpad-center"><span className="dpad-nub" /></div>
        {dirBtn("right", "d-right", "Derecha")}
        {dirBtn("down", "d-down", "Abajo")}
      </div>

      <div className="gb-ab">
        <button className="ab-btn b-btn" aria-label="B"
          onPointerDown={(e) => { e.preventDefault(); press("b"); }}>
          <span>B</span>
        </button>
        <button className="ab-btn a-btn" aria-label="A"
          onPointerDown={(e) => { e.preventDefault(); press("a"); }}>
          <span>A</span>
        </button>
      </div>

      <div className="gb-startselect">
        <button className="ss-btn" onPointerDown={(e) => { e.preventDefault(); press("b"); }}>
          <span className="ss-pill" /><label>SELECT</label>
        </button>
        <button className="ss-btn" onPointerDown={(e) => { e.preventDefault(); press("start"); }}>
          <span className="ss-pill" /><label>START</label>
        </button>
      </div>
    </div>
  );
}

/* ----------------------- boot animation ----------------------- */
function BootScreen({ onDone }) {
  uE(() => {
    SFX.resume();
    const t1 = setTimeout(() => SFX.boot(), 650);
    const t2 = setTimeout(onDone, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="scr boot-scr">
      <div className="boot-logo">
        <div className="boot-mark">◣◥<br/>◤◢</div>
        <div className="boot-text">ANDRADE&nbsp;SOFT</div>
      </div>
      <div className="boot-tm">™</div>
    </div>
  );
}

/* ----------------------- main app ----------------------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = uS("boot");
  const stageRef = uR(null);
  const gbRef = uR(null);
  const pKey = (t.palette || []).join(",");

  /* apply palette synchronously DURING render so child canvases (sprites)
     read fresh --c* vars when their redraw effects run (child effects fire
     before parent effects, so an effect here would be too late). */
  (t.palette || TWEAK_DEFAULTS.palette).forEach((c, i) =>
    document.documentElement.style.setProperty("--c" + i, c));

  uE(() => { SFX.setEnabled(!!t.sound); }, [t.sound]);

  /* scale the console to fit the viewport */
  uE(() => {
    const fit = () => {
      const gb = gbRef.current, st = stageRef.current;
      if (!gb || !st) return;
      const pad = 28;
      const natW = gb.offsetWidth || 460;
      const natH = gb.offsetHeight || 770;
      const s = Math.min((st.clientWidth - pad) / natW, (st.clientHeight - pad) / natH);
      gb.style.transform = `scale(${Math.max(0.3, s)})`;
    };
    fit();
    window.addEventListener("resize", fit);
    const id = setTimeout(fit, 200);
    return () => { window.removeEventListener("resize", fit); clearTimeout(id); };
  }, []);

  /* keyboard → input bus */
  uE(() => {
    const map = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
      z: "a", " ": "a", Enter: "start", x: "b", Backspace: "b", Escape: "b",
    };
    const onKey = (e) => {
      const act = map[e.key] || map[e.key.toLowerCase && e.key.toLowerCase()];
      if (!act) return;
      e.preventDefault();
      SFX.resume();
      fireInput(act);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goMenu = () => setScreen("menu");
  const goTitle = () => setScreen("title");

  const renderScreen = () => {
    switch (screen) {
      case "boot":  return <BootScreen onDone={() => setScreen("title")} />;
      case "title": return <TitleScreen paletteKey={pKey} onStart={goMenu} />;
      case "menu":  return <MenuScreen paletteKey={pKey} onPick={setScreen} onBack={goTitle} />;
      case "about": return <AboutScreen paletteKey={pKey} textSpeed={t.textSpeed} onBack={goMenu} />;
      case "projects":   return <ProjectsScreen paletteKey={pKey} onBack={goMenu} />;
      case "skills":     return <SkillsScreen paletteKey={pKey} onBack={goMenu} />;
      case "experience": return <ExperienceScreen paletteKey={pKey} onBack={goMenu} />;
      case "blog":       return <BlogScreen paletteKey={pKey} onBack={goMenu} />;
      case "contact":    return <ContactScreen paletteKey={pKey} onBack={goMenu} />;
      default: return null;
    }
  };

  return (
    <div className="gb-stage" ref={stageRef}>
      <div className={"gameboy shell-" + t.shell} ref={gbRef}>
        {/* upper bezel */}
        <div className="gb-bezel">
          <div className="gb-bezel-top">
            <span className="bz-line" /><span className="bz-line" />
            <span className="bz-label">DOT&nbsp;MATRIX&nbsp;WITH&nbsp;STEREO&nbsp;SOUND</span>
            <span className="bz-line" /><span className="bz-line" />
          </div>
          <div className="gb-screen-wrap">
            <div className="gb-power"><span className="pw-led" />POWER</div>
            <div className={"gb-lcd" + (t.scanlines ? " scan" : "") + (t.glow ? " glow" : "")}
                 data-screen-label={screen}>
              <div className="lcd-inner">{renderScreen()}</div>
              <div className="lcd-scan" aria-hidden="true" />
              <div className="lcd-glass" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="gb-brand">
          <b>DEV</b>BOY<span className="brand-mini">&nbsp;portfolio</span>
        </div>

        <ControlPad />

        <div className="gb-speaker" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => <span key={i} />)}
        </div>
      </div>

      {/* TWEAKS */}
      <TweaksPanel>
        <TweakSection label="Pantalla" />
        <TweakColor label="Paleta" value={t.palette}
          options={PALETTE_KEYS.map(k => PALETTES[k])}
          onChange={(v) => setTweak("palette", v)} />
        <TweakToggle label="Scanlines" value={t.scanlines} onChange={(v) => setTweak("scanlines", v)} />
        <TweakToggle label="Brillo CRT" value={t.glow} onChange={(v) => setTweak("glow", v)} />
        <TweakSection label="Consola" />
        <TweakRadio label="Carcasa" value={t.shell} options={["gris", "negro", "uva"]}
          onChange={(v) => setTweak("shell", v)} />
        <TweakSection label="Juego" />
        <TweakToggle label="Sonido" value={t.sound} onChange={(v) => setTweak("sound", v)} />
        <TweakSlider label="Velocidad texto" value={t.textSpeed} min={6} max={60} step={2}
          unit="ms" onChange={(v) => setTweak("textSpeed", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
