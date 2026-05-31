// importing required packages
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// allows backend to accept json data
app.use(express.json());
app.use(cors({
  origin: [process.env.CLIENT_URL, "https://distributedtaskqueue.vercel.app", "http://localhost:5173"].filter(Boolean),
  credentials: true
}));
app.use(cookieParser());

// auth routes
app.use("/api/auth", authRoutes);
// project routes
app.use("/api/project", projectRoutes);

// Serve frontend static files from the compiled React build
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Redirect all non-API GET requests to React's index.html (SPA fallback routing)
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

export default app;