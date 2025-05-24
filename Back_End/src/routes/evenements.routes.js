import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import { addEvenement, getCloudinarySignature } from "../controllers/evenements/addEvenement.js";
import { getEvenements } from "../controllers/evenements/getEvenements.js";
import { getEvenementById } from "../controllers/evenements/getEvenementById.js";
import { toggleLikeEvenement } from "../controllers/evenements/likeEvenement.js";
import { addCommentEvenement, deleteCommentEvenement } from "../controllers/evenements/commentEvenement.js";
import { rateEvenement, getEvenementRatings } from "../controllers/evenements/rateEvenement.js";
import { shareEvenement } from "../controllers/evenements/shareEvenement.js";
import { participerEvenement, checkParticipation } from "../controllers/evenements/participationEvenement.js";
import { desinscriptionEvenement } from "../controllers/evenements/desinscriptionEvenement.js";
import { deleteEvenement } from "../controllers/evenements/deleteEvenement.js";

const router = express.Router();

// Routes publiques
router.get("/", getEvenements);
router.get("/:id", getEvenementById);
router.get("/cloudinary-signature", getCloudinarySignature);

// Routes protégées (nécessitent une authentification)
router.use(authMiddleware);

// Routes pour les likes
router.post("/:id/like", toggleLikeEvenement);

// Routes pour les commentaires
router.post("/:id/comment", addCommentEvenement);
router.delete("/:id/comment/:commentId", deleteCommentEvenement);

// Routes pour les notes
router.post("/:id/rate", rateEvenement);

// Routes pour le partage
router.post("/:id/share", shareEvenement);

// Routes pour la participation
router.get("/:id/participation", checkParticipation);
router.post("/:id/participer", participerEvenement);
router.delete("/:id/desinscription", desinscriptionEvenement);

// Routes admin uniquement
router.use(isAdmin);
router.post("/add", addEvenement);
router.delete("/:id", deleteEvenement);
router.get("/:id/ratings", getEvenementRatings);

export default router; 