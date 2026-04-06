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

// 1. Failsafe manual de CORS (Para asegurar que incluso los errores tengan cabeceras)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// 2. Middleware estándar de CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

app.set("io", io);
initSocket(io);

// Rutas
app.get("/", (req, res) => {
  res.send("Andrade Estudio API is ONLINE");
});

app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    app: "Andrade Estudio API", 
    supabase: !!process.env.SUPABASE_URL 
  });
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
