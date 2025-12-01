import express from "express";
import { getBranches, registerBranch } from "../controllers/branchController.js";

const router = express.Router();

router.get("/", getBranches);     // GET /api/branches
router.post("/", registerBranch); // POST /api/branches

export default router;
