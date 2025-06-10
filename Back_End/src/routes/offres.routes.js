import express from "express";
import { addOffre, editOffre, deleteOffre, getOffres, getOffreById } from "../controllers/recruitement/index.js";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware,isAdmin, addOffre);
router.get("/", authMiddleware,getOffres);
router.get("/:id", authMiddleware, getOffreById);
router.put("/:id", authMiddleware, isAdmin, editOffre);
router.delete("/:id", authMiddleware, isAdmin, deleteOffre);

export default router;