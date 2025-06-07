import express from "express";
import { addOffre, editOffre, deleteOffre, getOffres, getOffreById } from "../controllers/recruitement/index.js";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", isAdmin, addOffre);
router.get("/", getOffres);
router.get("/:id", getOffreById);
router.put("/:id", authMiddleware, isAdmin, editOffre);
router.delete("/:id", authMiddleware, isAdmin, deleteOffre);

export default router; 