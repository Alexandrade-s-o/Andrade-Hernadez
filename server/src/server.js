require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.routes");
const briefRoutes = require("./routes/brief.routes");
const initSocket = require("./socket");

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://andrade-hernadez.vercel.app",
  "https://andrade-estudio.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);
initSocket(io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Andrade Estudio API", supabase: !!process.env.SUPABASE_URL });
});

app.use("/api/auth", authRoutes);
app.use("/api/briefs", briefRoutes);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ Server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL || "⚠️  NOT SET"}`);
});
