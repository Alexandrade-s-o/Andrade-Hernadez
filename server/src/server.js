require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth.routes");
const briefRoutes = require("./routes/brief.routes");
const initSocket = require("./socket");

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://andrade-hernadez.vercel.app",
  "https://andrade-estudio.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  ...configuredOrigins,
].filter(Boolean);

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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

// Global error handler — ensures CORS headers are present even on 500 errors
// Without this, unhandled errors bypass the cors middleware and the browser
// reports them as CORS errors instead of server errors.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ Server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL || "⚠️  NOT SET"}`);
});
