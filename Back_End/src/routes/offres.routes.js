import express from "express";
import { addOffre, editOffre, deleteOffre, getOffres, getOffreById } from "../controllers/recruitement/index.js";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";
import {addCandidature} from "../controllers/recruitement/addCandidature.js";
import {upload, uploadInMemory} from "../middleware/storage.middleware.js";

const router = express.Router();

router.post("/add",authMiddleware ,isAdmin, addOffre);
router.get("/", getOffres);
router.get("/:id", getOffreById);
router.put("/:id", authMiddleware, isAdmin, editOffre);
router.delete("/:id", authMiddleware, isAdmin, deleteOffre);
router.post("/:id/apply",authMiddleware,uploadInMemory.single("cv"),addCandidature);
export default router; 