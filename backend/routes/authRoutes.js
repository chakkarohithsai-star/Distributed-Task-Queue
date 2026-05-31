import express from "express";
import { login, register, getWorkers, googleSSO } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-sso", googleSSO);
router.get("/workers", verifyToken, getWorkers);

export default router;