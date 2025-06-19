import express from "express";
import { addOffre, editOffre, deleteOffre, getOffres, getOffreById } from "../controllers/recruitement/index.js";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";
import {addCandidature} from "../controllers/recruitement/addCandidature.js";
import {uploadCandidature} from "../middleware/storage.middleware.js";
import {deleteCandidature} from "../controllers/recruitement/deleteCandidature.js";
import {
    getAllCandidaturesByOfferId,
    getAllCandidaturesByUserId,
    getCandidatureById
} from "../controllers/recruitement/getCandidature.js";
import {checkCandidature} from "../controllers/recruitement/checkCandidature.js";
import {acceptCandidature} from "../controllers/recruitement/acceptCandidature.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/add",authMiddleware ,isAdmin, addOffre);
router.get("/", getOffres);
router.get("/:id", getOffreById);
router.put("/:id", authMiddleware, isAdmin, editOffre);
router.delete("/:id", authMiddleware, isAdmin, deleteOffre);
router.post("/:id/apply",authMiddleware,uploadCandidature.single("candidatCV"),addCandidature);
router.get("/:id/apply/check",authMiddleware,checkCandidature);

//sends a Zoom meeting link to the candidate
router.post("/:id/accept/:candidatureId", authMiddleware, isAdmin, acceptCandidature);

//only admin can get all candidatures by offer id
router.get("/:id/apply/getall",authMiddleware,isAdmin,getAllCandidaturesByOfferId);
//author of the candidature and admin
router.get("/:id/apply/getall/:userId",authMiddleware,getAllCandidaturesByUserId);
router.get("/:id/apply/:candidatureId",authMiddleware,getCandidatureById);
router.delete("/:id/apply/delete/:candidatureId",authMiddleware,deleteCandidature);

export default router;