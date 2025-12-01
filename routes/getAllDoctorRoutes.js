import express from "express";
import { getAllDoctor } from "../controllers/allDoctorController.js";

const router = express.Router();

router.get("/", getAllDoctor);  // GET /api/dentists

export default router;
