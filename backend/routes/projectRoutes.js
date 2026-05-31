import express from "express";

import {
  createProject,
  getAllProjects,
  getProjectTasks,
  updateTaskStatus, // Imported status updater
} from "../controllers/projectController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// create project
router.post(
  "/create",
  verifyToken,
  createProject
);

// get all projects
router.get(
  "/all",
  verifyToken,
  getAllProjects
);

// get project tasks
router.get(
  "/:id/tasks",
  verifyToken,
  getProjectTasks
);

// update task status (new: handles worker actions)
router.put(
  "/task/:taskId/status",
  verifyToken,
  updateTaskStatus
);

export default router;