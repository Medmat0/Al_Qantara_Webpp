import express from "express";
import { addOffre, editOffre, deleteOffre, getOffres, getOffreById } from "../controllers/recruitement/index.js";

const router = express.Router();

router.post("/add", addOffre);
router.get("/", getOffres);
router.get("/:id", getOffreById);
router.put("/:id", editOffre);
router.delete("/:id", deleteOffre);

export default router; 