import express from "express";
import { getServices, registerService } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getServices);     // GET /api/services
router.post("/", registerService); // POST /api/services

export default router;
