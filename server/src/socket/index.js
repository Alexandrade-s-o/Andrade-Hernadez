const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("No autorizado"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);

      const { data: user, error } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("id", payload.id)
        .single();

      if (error || !user) {
        return next(new Error("No autorizado"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("No autorizado"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`role:${socket.user.role}`);

    socket.on("brief:join", async ({ briefId }) => {
      if (!briefId) return;

      const { data: brief } = await supabase
        .from("briefs")
        .select("id, client_id")
        .eq("id", briefId)
        .maybeSingle();

      if (!brief) return;

      const isOwner = brief.client_id === socket.user.id;
      const isProducer = socket.user.role === "productor";

      if (!isOwner && !isProducer) return;

      socket.join(`brief:${briefId}`);
    });

    socket.on("message:send", async ({ briefId, text }) => {
      if (!briefId || !text?.trim()) return;

      const { data: brief } = await supabase
        .from("briefs")
        .select("id, client_id")
        .eq("id", briefId)
        .maybeSingle();

      if (!brief) return;

      const isOwner = brief.client_id === socket.user.id;
      const isProducer = socket.user.role === "productor";
      if (!isOwner && !isProducer) return;

      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          brief_id: briefId,
          sender_id: socket.user.id,
          sender_role: socket.user.role,
          text: text.trim(),
        })
        .select("id, brief_id, text, sender_role, created_at")
        .single();

      if (error) return;

      io.to(`brief:${briefId}`).emit("message:new", {
        id: message.id,
        brief: message.brief_id,
        text: message.text,
        sender: {
          id: socket.user.id,
          name: socket.user.name,
          role: socket.user.role,
        },
        senderRole: message.sender_role,
        createdAt: message.created_at,
      });
    });
  });
};

module.exports = initSocket;
