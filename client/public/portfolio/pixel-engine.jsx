/* ============================================================
   PIXEL ENGINE — sprites (canvas), retro sound, typewriter, palettes
   Exposes everything on window for the other babel scripts.
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------- PALETTES (4 shades: 0 darkest "ink" .. 3 lightest "screen") ---------- */
const PALETTES = {
  "Verde DMG":  ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"],
  "Pocket":     ["#181818", "#4a4a4a", "#9a9a9a", "#d8d8cf"],
  "Ámbar":      ["#3a1d00", "#7a4510", "#d28a2c", "#f2dca6"],
  "Lavanda":    ["#241a3a", "#54407e", "#9b86cf", "#e7defb"],
  "Helado":     ["#5a2b3a", "#c64f63", "#f0a868", "#fff6d3"],
};
const PALETTE_KEYS = Object.keys(PALETTES);

/* ---------- RETRO SOUND (Web Audio, square waves) ---------- */
function makeAudio() {
  let ctx = null;
  let enabled = true;
  const ensure = () => {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const tone = (freq, dur, type = "square", vol = 0.06, when = 0) => {
    const c = ensure(); if (!c || !enabled) return;
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  };
  return {
    setEnabled: (v) => { enabled = v; },
    resume: () => ensure(),
    move:    () => tone(330, 0.05, "square", 0.05),
    confirm: () => { tone(520, 0.06); tone(780, 0.08, "square", 0.06, 0.06); },
    back:    () => { tone(400, 0.06); tone(240, 0.09, "square", 0.05, 0.05); },
    coin:    () => { tone(988, 0.05); tone(1319, 0.12, "square", 0.06, 0.05); },
    blip:    () => tone(660, 0.018, "square", 0.025),
    start: () => {
      const seq = [[523,0],[659,0.10],[784,0.20],[1047,0.32]];
      seq.forEach(([f, w]) => tone(f, 0.16, "square", 0.06, w));
    },
    boot: () => { tone(784, 0.10, "triangle", 0.08); tone(1175, 0.22, "triangle", 0.07, 0.12); },
  };
}
const SFX = makeAudio();

/* ---------- INPUT BUS ----------
   App dispatches window 'gbinput' CustomEvents (detail = action string).
   The active screen subscribes via useGBInput. Only one screen mounted at a
   time, so no conflicts. Actions: up|down|left|right|a|b|start */
function fireInput(action) {
  window.dispatchEvent(new CustomEvent("gbinput", { detail: action }));
}
function useGBInput(handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const fn = (e) => ref.current && ref.current(e.detail);
    window.addEventListener("gbinput", fn);
    return () => window.removeEventListener("gbinput", fn);
  }, []);
}

/* ---------- TYPEWRITER HOOK ---------- */
function useTypewriter(text, speed = 28, active = true, onTick) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setOut(text); setDone(true); return; }
    setOut(""); setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (onTick && text[i - 1] && text[i - 1] !== " ") onTick();
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return [out, done, () => { setOut(text); setDone(true); }];
}

/* ---------- PIXEL SPRITE DRAWING ----------
   We draw a front-facing little developer hero on a small grid, scaled up
   with image-rendering: pixelated. Colors are pulled live so palette swaps
   recolor the sprite. Frames: idle, blink, walk1, walk2. */
const HERO_W = 18, HERO_H = 20;

function drawHero(ctx, frame, c) {
  // c = [ink, dark, light, screen]
  const ink = c[0], dark = c[1], skin = c[2];
  ctx.clearRect(0, 0, HERO_W, HERO_H);
  const R = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

  const bob = (frame === "walk2") ? 1 : 0; // body bobs down on alt walk frame
  const oy = bob;

  // --- HAIR / CAP (dark) with outline ---
  R(5, 1 + oy, 8, 1, ink);           // top outline
  R(4, 2 + oy, 10, 2, dark);         // hair block
  R(4, 2 + oy, 1, 2, ink); R(13, 2 + oy, 1, 2, ink); // side outlines of hair
  R(4, 1 + oy, 1, 1, ink); R(13, 1 + oy, 1, 1, ink);

  // --- FACE (skin) ---
  R(5, 4 + oy, 8, 5, skin);
  // face outline
  R(4, 4 + oy, 1, 5, ink); R(13, 4 + oy, 1, 5, ink);
  R(5, 9 + oy, 8, 1, ink);           // chin/jaw outline
  // sideburns / hair frame on cheeks
  R(5, 4 + oy, 1, 1, dark); R(12, 4 + oy, 1, 1, dark);

  // --- EYES ---
  if (frame === "blink") {
    R(6, 7 + oy, 2, 1, ink); R(11, 7 + oy, 2, 1, ink);
  } else {
    R(6, 6 + oy, 2, 2, ink); R(11, 6 + oy, 2, 2, ink);
  }
  // --- MOUTH ---
  R(8, 8 + oy, 2, 1, ink);

  // --- NECK ---
  R(8, 10 + oy, 2, 1, skin);

  // --- BODY / HOODIE (dark) ---
  R(5, 11 + oy, 8, 5, dark);
  R(4, 11 + oy, 1, 5, ink); R(13, 11 + oy, 1, 5, ink);   // body outline
  R(5, 11 + oy, 8, 1, ink);                               // shoulders top outline
  // hoodie zipper / shirt highlight
  R(8, 12 + oy, 2, 3, skin);
  R(9, 12 + oy, 1, 3, dark);

  // --- ARMS (skin hands) ---
  R(4, 12 + oy, 1, 3, dark); R(13, 12 + oy, 1, 3, dark);
  R(4, 14 + oy, 1, 1, skin); R(13, 14 + oy, 1, 1, skin); // hands

  // --- LEGS (animate) ---
  if (frame === "walk1") {
    R(5, 16 + oy, 2, 4, ink); R(11, 16 + oy, 2, 3, ink);
  } else if (frame === "walk2") {
    R(6, 16 + oy, 2, 3, ink); R(10, 16 + oy, 2, 4, ink);
  } else {
    R(6, 16 + oy, 2, 4, ink); R(10, 16 + oy, 2, 4, ink);
  }
  // feet (light)
  if (frame === "walk1") { R(5, 19, 2, 1, dark); R(11, 18 + oy, 2, 1, dark); }
  else if (frame === "walk2") { R(6, 18 + oy, 2, 1, dark); R(10, 19, 2, 1, dark); }
  else { R(6, 19, 2, 1, dark); R(10, 19, 2, 1, dark); }
}

/* Generic pixel sprite drawn from a string-grid (for icons). */
function drawGrid(ctx, grid, c) {
  ctx.clearRect(0, 0, grid[0].length, grid.length);
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const ch = grid[y][x];
      if (ch === "." || ch === " ") continue;
      const idx = parseInt(ch, 10);
      ctx.fillStyle = c[idx] || c[0];
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

/* Live palette read from CSS vars so sprites recolor on tweak change. */
function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  return [0, 1, 2, 3].map(i => cs.getPropertyValue("--c" + i).trim() || "#000");
}

/* HeroSprite: animated character. mode: idle | walk. faces handled by translate in app. */
function HeroSprite({ size = 4, walking = false, paletteKey, style }) {
  const ref = useRef(null);
  const [frame, setFrame] = useState("idle");

  // idle blink loop
  useEffect(() => {
    if (walking) return;
    let alive = true;
    const loop = () => {
      if (!alive) return;
      setFrame("idle");
      const t1 = setTimeout(() => { if (alive) setFrame("blink"); }, 2600 + Math.random() * 1500);
      const t2 = setTimeout(() => { if (alive) loop(); }, 2900 + Math.random() * 1500);
      window.__heroTimers = [t1, t2];
    };
    loop();
    return () => { alive = true; setFrame("idle"); };
  }, [walking]);

  // walk loop
  useEffect(() => {
    if (!walking) return;
    let f = 0;
    const id = setInterval(() => { f ^= 1; setFrame(f ? "walk1" : "walk2"); }, 150);
    return () => clearInterval(id);
  }, [walking]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawHero(ctx, frame, readPalette());
  }, [frame, paletteKey, walking]);

  return (
    <canvas
      ref={ref}
      width={HERO_W}
      height={HERO_H}
      style={{
        width: HERO_W * size, height: HERO_H * size,
        imageRendering: "pixelated", display: "block", ...style,
      }}
    />
  );
}

/* IconSprite: small static pixel icons from a grid. */
function IconSprite({ grid, size = 3, paletteKey, style }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawGrid(ctx, grid, readPalette());
  }, [grid, paletteKey]);
  return (
    <canvas ref={ref} width={grid[0].length} height={grid.length}
      style={{ width: grid[0].length * size, height: grid.length * size,
        imageRendering: "pixelated", display: "block", ...style }} />
  );
}

/* A few tiny icon grids (8x8) for menu / sections. 0 ink,1 dark,2 light. */
const ICONS = {
  heart: ["........",".11..11.","1221221.","1222221.","1222221.",".12221..","..121...","...1...."],
  sword: ["......11","....112.","...112..","..112...","1112....","21.1....","1..1....","........"],
  book:  [".111111.","1222221.","1211121.","1222221.","1211121.","1222221.","1222221.",".111111."],
  star:  ["...11...","...11...","11111111","11111111",".111111.","..1111..",".11..11.","1......1"],
  chip:  ["..1111..",".122221.","11211211","12222221","12222221","11211211",".122221.","..1111.."],
  mail:  ["11111111","12211221","12121211","12112121","12111121","12111121","12111121","11111111"],
  flag:  [".1......",".122221.",".121121.",".122221.",".1......",".1......",".1......",".1......"],
};

Object.assign(window, {
  PALETTES, PALETTE_KEYS, SFX, useTypewriter, fireInput, useGBInput,
  HeroSprite, IconSprite, ICONS, readPalette,
});
