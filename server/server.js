import express from "express";
import cors from "cors";
import "dotenv/config";

// ── Route imports ──────────────────────────────────
import userRoutes from "./src/routes/users.js";
import sightingRoutes from "./src/routes/sightings.js";
import uploadRoutes from "./src/routes/upload.js";
import chatRoutes from "./src/routes/chat.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));

// Manual CORS fallback for preflight
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

app.use(express.json({ limit: "10mb" }));

// ── Health Check ───────────────────────────────────
app.get("/api/health", (req, res) => {
  console.log("🩺 Health Check from:", req.headers.origin);
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    db: !!process.env.DATABASE_URL
  });
});

// ── API Routes ─────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/sightings", sightingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

// ── Start Server ───────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🦎 BioDex API running on http://0.0.0.0:${PORT}`);
});
