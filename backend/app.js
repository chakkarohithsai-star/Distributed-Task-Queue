// importing required packages
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();

// allows backend to accept json data
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// auth routes
app.use("/api/auth", authRoutes);
// project routes
app.use("/api/project", projectRoutes);

export default app;