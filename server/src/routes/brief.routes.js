const express = require("express");
const supabase = require("../config/supabase");
const { auth, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Consulta reutilizable con joins de usuarios y archivos
const BRIEF_SELECT = `
  id, project_name, description, deadline, status, created_at, updated_at,
  client:users!client_id(id, name, email, role),
  assigned_producer:users!assigned_producer_id(id, name, email, role),
  files:brief_files(id, filename, original_name, mimetype, size, url)
`;

const formatBrief = (brief) => ({
  id: brief.id,
  projectName: brief.project_name,
  description: brief.description,
  deadline: brief.deadline,
  status: brief.status,
  files: (brief.files || []).map((f) => ({
    filename: f.filename,
    originalName: f.original_name,
    mimetype: f.mimetype,
    size: f.size,
    url: f.url,
  })),
  client: brief.client,
  assignedProducer: brief.assigned_producer,
  createdAt: brief.created_at,
  updatedAt: brief.updated_at,
});

// Sube un archivo al bucket de Supabase Storage y devuelve la URL pública
const uploadFileToStorage = async (file) => {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("brief-files")
    .upload(uniqueName, file.buffer, { contentType: file.mimetype });

  if (error) throw error;

  const { data } = supabase.storage.from("brief-files").getPublicUrl(uniqueName);

  return {
    filename: uniqueName,
    original_name: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: data.publicUrl,
  };
};

router.post("/", auth, authorize("cliente"), upload.array("files", 5), async (req, res) => {
  try {
    const { projectName, description, deadline, assignedProducer } = req.body;

    if (!projectName || !description || !deadline) {
      return res.status(400).json({ message: "Proyecto, descripción y deadline son obligatorios." });
    }

    // Subir archivos a Supabase Storage
    const uploadedFiles = await Promise.all((req.files || []).map(uploadFileToStorage));

    // Insertar brief
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .insert({
        project_name: projectName,
        description,
        deadline: new Date(deadline).toISOString(),
        client_id: req.user.id,
        assigned_producer_id: assignedProducer || null,
      })
      .select("id")
      .single();

    if (briefError) {
      return res.status(500).json({ message: "No se pudo crear el brief." });
    }

    // Insertar archivos asociados
    if (uploadedFiles.length > 0) {
      await supabase
        .from("brief_files")
        .insert(uploadedFiles.map((f) => ({ ...f, brief_id: brief.id })));
    }

    // Obtener brief completo con joins
    const { data: fullBrief } = await supabase
      .from("briefs")
      .select(BRIEF_SELECT)
      .eq("id", brief.id)
      .single();

    const io = req.app.get("io");
    io.to("role:productor").emit("brief:new", formatBrief(fullBrief));

    return res.status(201).json(formatBrief(fullBrief));
  } catch (error) {
    return res.status(500).json({ message: "No se pudo crear el brief." });
  }
});

router.get("/client", auth, authorize("cliente"), async (req, res) => {
  try {
    const { data: briefs, error } = await supabase
      .from("briefs")
      .select(BRIEF_SELECT)
      .eq("client_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: "No se pudieron cargar tus briefs." });
    }

    return res.json(briefs.map(formatBrief));
  } catch (error) {
    return res.status(500).json({ message: "No se pudieron cargar tus briefs." });
  }
});

router.get("/producer", auth, authorize("productor"), async (_req, res) => {
  try {
    const { data: briefs, error } = await supabase
      .from("briefs")
      .select(BRIEF_SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: "No se pudieron cargar los briefs." });
    }

    return res.json(briefs.map(formatBrief));
  } catch (error) {
    return res.status(500).json({ message: "No se pudieron cargar los briefs." });
  }
});

router.patch("/:id/status", auth, authorize("productor"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Recibido", "En Proceso", "Completado"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido." });
    }

    const { data: existing } = await supabase
      .from("briefs")
      .select("id, assigned_producer_id")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return res.status(404).json({ message: "Brief no encontrado." });
    }

    const updates = { status };
    if (!existing.assigned_producer_id) {
      updates.assigned_producer_id = req.user.id;
    }

    await supabase.from("briefs").update(updates).eq("id", id);

    const { data: fullBrief } = await supabase
      .from("briefs")
      .select(BRIEF_SELECT)
      .eq("id", id)
      .single();

    const io = req.app.get("io");
    io.to(`brief:${id}`).emit("brief:updated", formatBrief(fullBrief));

    return res.json(formatBrief(fullBrief));
  } catch (error) {
    return res.status(500).json({ message: "No se pudo actualizar el estado." });
  }
});

router.get("/:id/messages", auth, async (req, res) => {
  try {
    const { data: brief } = await supabase
      .from("briefs")
      .select("id, client_id")
      .eq("id", req.params.id)
      .maybeSingle();

    if (!brief) {
      return res.status(404).json({ message: "Brief no encontrado." });
    }

    const canAccess = req.user.role === "productor" || brief.client_id === req.user.id;
    if (!canAccess) {
      return res.status(403).json({ message: "No puedes acceder a este chat." });
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("id, brief_id, text, sender_role, created_at, sender:users!sender_id(id, name, role)")
      .eq("brief_id", req.params.id)
      .order("created_at", { ascending: true });

    return res.json(
      (messages || []).map((m) => ({
        id: m.id,
        brief: m.brief_id,
        text: m.text,
        sender: m.sender,
        senderRole: m.sender_role,
        createdAt: m.created_at,
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "No se pudo cargar el historial de mensajes." });
  }
});

module.exports = router;
