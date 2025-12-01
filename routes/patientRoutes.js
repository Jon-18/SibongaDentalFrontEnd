import express from "express";
import { getPatients, registerPatient } from "../controllers/patientController.js";

const router = express.Router();

// ✅ RESTful endpoints
router.get("/", getPatients);             // GET /api/patients/
router.post("/", registerPatient);        // POST /api/patients/

export default router;
