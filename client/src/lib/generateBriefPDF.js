import { jsPDF } from "jspdf";

/* ── Paleta ──────────────────────────────────────────────────── */
const C = {
  black:   [0,   0,   0  ],
  white:   [255, 255, 255],
  cyan:    [0,   188, 212],
  cyanLt:  [232, 249, 252],   // fondo suave cian
  gray1:   [30,  30,  35 ],   // texto oscuro
  gray2:   [100, 100, 110],   // texto secundario
  gray3:   [155, 155, 165],   // texto terciario
  gray4:   [230, 230, 235],   // bordes/líneas
  bg:      [248, 249, 251],   // fondo de tarjeta
  orange:  [255, 149, 0  ],
  green:   [52,  199, 89 ],
};

/* ── Helpers ─────────────────────────────────────────────────── */
const rgb  = (doc, c)            => doc.setTextColor(...c);
const fill = (doc, c)            => doc.setFillColor(...c);
const draw = (doc, c)            => doc.setDrawColor(...c);
const font = (doc, size, style="normal") => { doc.setFontSize(size); doc.setFont("helvetica", style); };

function rect(doc, x, y, w, h, color, r=0) {
  fill(doc, color);
  if (r > 0) doc.roundedRect(x, y, w, h, r, r, "F");
  else       doc.rect(x, y, w, h, "F");
}

function hline(doc, x1, x2, y, color=C.gray4, lw=0.3) {
  draw(doc, color);
  doc.setLineWidth(lw);
  doc.line(x1, y, x2, y);
}

/* ── Parse description helper ────────────────────────────────── */
function parseDescription(raw="") {
  const idx   = raw.indexOf("Checklist");
  const intro = idx > -1 ? raw.slice(0, idx).trim() : raw.trim();
  const block = idx > -1 ? raw.slice(idx).trim() : "";

  const fields = {};
  block.split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("-"))
    .forEach(line => {
      const noDash = line.slice(1).trim();
      const colon  = noDash.indexOf(":");
      if (colon === -1) return;
      const key = noDash.slice(0, colon).trim();
      const val = noDash.slice(colon + 1).trim();
      if (val && val !== "Sin especificar" && val !== "No definido" && val !== "Sin referencias")
        fields[key] = val;
    });

  return { intro, fields };
}

/* ── Pill (small colored tag) ─────────────────────────────────── */
function drawPill(doc, text, x, y, bg, textColor) {
  font(doc, 7, "bold");
  const tw = doc.getTextWidth(text);
  const pw = tw + 8;
  const ph = 5.5;
  rect(doc, x, y - 3.8, pw, ph, bg, 2);
  rgb(doc, textColor);
  doc.text(text, x + 4, y);
  return pw + 3; // width consumed
}

/* ── Section title ────────────────────────────────────────────── */
function sectionTitle(doc, label, x, y) {
  font(doc, 6.5, "bold");
  rgb(doc, C.cyan);
  doc.text(label.toUpperCase(), x, y);
}

/* ── Main export ─────────────────────────────────────────────── */
export function generateBriefPDF(brief) {
  const doc  = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W    = 210;
  const H    = 297;
  const pad  = 16;
  const cW   = W - pad * 2;   // content width = 178mm

  const { intro, fields } = parseDescription(brief.description || "");

  /* ─── HEADER ─────────────────────────────────────────────── */
  // Black band
  rect(doc, 0, 0, W, 42, C.black);
  // Cyan accent stripe
  rect(doc, 0, 42, W, 1.8, C.cyan);

  // Logo — uses uppercase spacing to simulate Bebas Neue feel in PDF
  font(doc, 15, "bold"); rgb(doc, C.white);
  doc.text("ANDRADE", pad, 20);
  const logoW = doc.getTextWidth("ANDRADE ");
  font(doc, 15, "bold"); rgb(doc, C.cyan);
  doc.text("ESTUDIO", pad + logoW, 20);

  // Tagline
  font(doc, 7, "normal"); rgb(doc, C.gray3);
  doc.text("PLATAFORMA DE PRODUCCIÓN MULTIMEDIA", pad, 29);

  // Document type (top right)
  font(doc, 6.5, "bold"); rgb(doc, C.gray3);
  doc.text("BRIEF DE PROYECTO", W - pad, 20, { align:"right" });
  font(doc, 7, "normal"); rgb(doc, C.gray2);
  const dateStr = brief.createdAt
    ? new Date(brief.createdAt).toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" })
    : new Date().toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" });
  doc.text(dateStr, W - pad, 27, { align:"right" });

  /* ─── PROJECT NAME BLOCK ─────────────────────────────────── */
  let y = 56;

  // Status pill
  const status     = brief.status || "Recibido";
  const statusBg   = status === "Completado" ? C.green : status === "En Proceso" ? C.orange : C.cyan;
  drawPill(doc, status.toUpperCase(), pad, y, statusBg, C.white);
  y += 8;

  // Title
  font(doc, 26, "bold"); rgb(doc, C.gray1);
  doc.setCharSpace(0.5);
  const titleLines = doc.splitTextToSize(brief.projectName || "Sin título", cW);
  doc.text(titleLines, pad, y);
  doc.setCharSpace(0);
  y += titleLines.length * 12 + 2;

  // ID
  font(doc, 7, "normal"); rgb(doc, C.gray3);
  doc.text(`ID: ${brief.id?.slice(0,16) || "—"}`, pad, y);
  y += 10;

  // Full-width cyan divider
  hline(doc, pad, W - pad, y, C.cyan, 0.6);
  y += 10;

  /* ─── TWO-COLUMN INFO GRID ───────────────────────────────── */
  // Column widths
  const colA  = cW * 0.58;  // left  ~103mm
  const colB  = cW * 0.38;  // right ~68mm
  const gutter = cW * 0.04; // gap   ~7mm
  const xA = pad;
  const xB = pad + colA + gutter;

  const gridTop = y;

  /* ── LEFT column: Concept / Description ──────────────────── */
  sectionTitle(doc, "Concepto & Mensaje", xA, y);
  y += 5;

  if (intro) {
    font(doc, 9, "normal"); rgb(doc, C.gray1);
    const introLines = doc.splitTextToSize(intro, colA - 2);
    doc.text(introLines, xA, y);
    y += introLines.length * 5 + 8;
  }

  // Deliverables
  if (fields["Entregables"]) {
    sectionTitle(doc, "Entregables", xA, y); y += 5;
    const tags = fields["Entregables"].split(",").map(t => t.trim());
    let px = xA;
    tags.forEach(tag => {
      if (px + doc.getTextWidth(tag) + 12 > xA + colA) { px = xA; y += 7; }
      const w = drawPill(doc, tag, px, y, C.cyanLt, C.cyan);
      px += w;
    });
    y += 10;
  }

  // Plataformas
  if (fields["Plataformas"]) {
    sectionTitle(doc, "Plataformas", xA, y); y += 5;
    const tags = fields["Plataformas"].split(",").map(t => t.trim());
    let px = xA;
    tags.forEach(tag => {
      if (px + doc.getTextWidth(tag) + 12 > xA + colA) { px = xA; y += 7; }
      const w = drawPill(doc, tag, px, y, [230,230,235], C.gray2);
      px += w;
    });
    y += 10;
  }

  // Estilo Visual
  if (fields["Estilo visual"]) {
    sectionTitle(doc, "Estilo Visual", xA, y); y += 5;
    const tags = fields["Estilo visual"].split(",").map(t => t.trim());
    let px = xA;
    tags.forEach(tag => {
      if (px + doc.getTextWidth(tag) + 12 > xA + colA) { px = xA; y += 7; }
      const w = drawPill(doc, tag, px, y, [240,240,245], C.gray1);
      px += w;
    });
    y += 10;
  }

  /* ── RIGHT column: meta info cards ──────────────────────── */
  let yR = gridTop;

  // Helper: info card
  const infoCard = (label, value, bgColor=C.bg) => {
    if (!value) return;
    const cardH = 18;
    rect(doc, xB, yR, colB, cardH, bgColor, 3);
    sectionTitle(doc, label, xB + 5, yR + 5.5);
    font(doc, 9.5, "bold"); rgb(doc, C.gray1);
    const vLines = doc.splitTextToSize(String(value), colB - 10);
    doc.text(vLines[0], xB + 5, yR + 12.5);
    yR += cardH + 4;
  };

  infoCard("Tipo de Proyecto",  fields["Tipo"]);
  infoCard("Prioridad",         fields["Prioridad"],
    fields["Prioridad"] === "Alta" ? [255,240,235] :
    fields["Prioridad"] === "Media" ? [255,249,230] : C.bg);
  infoCard("Objetivo",          fields["Objetivo"]);
  infoCard("Audiencia",         fields["Audiencia"]);
  if (fields["Presupuesto estimado"]) infoCard("Presupuesto", fields["Presupuesto estimado"]);
  if (fields["Referencias"])          infoCard("Referencias",  fields["Referencias"]);

  // Deadline card (prominent)
  if (brief.deadline) {
    const dl = new Date(brief.deadline).toLocaleDateString("es-ES", { day:"numeric", month:"long", year:"numeric" });
    rect(doc, xB, yR, colB, 22, C.cyanLt, 3);
    // Cyan left bar
    rect(doc, xB, yR, 2.5, 22, C.cyan, 0);
    sectionTitle(doc, "Fecha de Entrega", xB + 7, yR + 6);
    font(doc, 10, "bold"); rgb(doc, C.gray1);
    doc.text(dl, xB + 7, yR + 14);
    yR += 26;
  }

  /* ── Advance y past both columns ─────────────────────────── */
  y = Math.max(y, yR) + 4;

  hline(doc, pad, W - pad, y, C.gray4, 0.3);
  y += 8;

  /* ─── FILES SECTION ──────────────────────────────────────── */
  if (brief.files && brief.files.length > 0) {
    sectionTitle(doc, "Archivos Adjuntos", pad, y); y += 6;
    brief.files.forEach(f => {
      const name = typeof f === "string" ? f : (f.name || f.url || "—");
      // file row
      rect(doc, pad, y - 4, cW, 8, C.bg, 2);
      font(doc, 8, "normal"); rgb(doc, C.gray2);
      doc.text(`📎  ${name}`, pad + 4, y + 0.5);
      y += 11;
    });
    y += 4;
  }

  /* ─── FOOTER ─────────────────────────────────────────────── */
  // Footer bar
  rect(doc, 0, H - 14, W, 14, C.black);
  font(doc, 7, "normal"); rgb(doc, C.gray3);
  doc.text(`Andrade Estudio  ·  Brief ID: ${brief.id?.slice(0,16) || "—"}`, pad, H - 6);
  font(doc, 7, "bold"); rgb(doc, C.cyan);
  doc.text("andrade-estudio.com", W - pad, H - 6, { align:"right" });

  /* ─── Save ───────────────────────────────────────────────── */
  const name = `Brief-${(brief.projectName || "documento").replace(/\s+/g,"_")}.pdf`;
  doc.save(name);
}
