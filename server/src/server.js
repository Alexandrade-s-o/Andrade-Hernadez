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
  "https://andrade-hernadez.vercel.app",   // Variant 1
  "https://andrade-hernandez.vercel.app", // Variant 2 (most likely)
  "https://andrade-estudio.vercel.app",
  "https://andradeestudio.com", 
  "http://localhost:5173",
  "http://localhost:3000",
  ...configuredOrigins,
].filter(Boolean);

const app = express();

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || "No Origin"}`);
  next();
});

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      // Direct match
      if (allowed === origin) return true;
      // Match without trailing slash
      if (allowed.replace(/\/$/, "") === origin.replace(/\/$/, "")) return true;
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked for origin: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Better preflight handling

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
    supabase: !!process.env.SUPABASE_URL,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "production"
  });
});

// Test endpoint for CORS debugging
app.get("/api/test-cors", (req, res) => {
  res.json({
    message: "CORS test successful",
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/briefs", briefRoutes);

// Catch-all for 404s to help debugging
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: `Ruta no encontrada: ${req.method} ${req.url}`,
    path: req.url,
    method: req.method
  });
});

// Global error handler — ensures CORS headers are present even on 500 errors
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("Global Error:", err.message);
  const origin = req.headers.origin;
  if (origin) {
    // In error case, try to be helpful with CORS if it's an allowed origin
    const isAllowed = allowedOrigins.some(allowed => 
      allowed.replace(/\/$/, "") === origin.replace(/\/$/, "")
    );
    if (isAllowed) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }
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
