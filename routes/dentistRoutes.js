import express from "express";
import { getDentists, registerDentist } from "../controllers/dentistController.js";

const router = express.Router();

router.get("/", getDentists);  // GET /api/dentists
router.post("/", registerDentist);  // POST /api/dentists

export default router;
