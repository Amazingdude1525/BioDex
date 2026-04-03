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
  origin: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5174", "http://localhost:5173"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ── Health Check ───────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
