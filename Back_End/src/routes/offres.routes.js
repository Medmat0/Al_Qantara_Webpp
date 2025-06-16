import express from "express";
import { addOffre, editOffre, deleteOffre, getOffres, getOffreById } from "../controllers/recruitement/index.js";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";
import {addCandidature} from "../controllers/recruitement/addCandidature.js";
import {uploadCandidature} from "../middleware/storage.middleware.js";
import {deleteCandidature} from "../controllers/recruitement/deleteCandidature.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/add",authMiddleware ,isAdmin, addOffre);
router.get("/", getOffres);
router.get("/:id", getOffreById);
router.put("/:id", authMiddleware, isAdmin, editOffre);
router.delete("/:id", authMiddleware, isAdmin, deleteOffre);
router.post("/:id/apply",authMiddleware,uploadCandidature.single("candidatCV"),addCandidature);
router.get(":id/apply/getall",authMiddleware,isAdmin,);
router.get(":id/apply/:candidatureId",authMiddleware,);
router.delete("/:id/apply/delete/:candidatureId",authMiddleware,deleteCandidature);

export default router;