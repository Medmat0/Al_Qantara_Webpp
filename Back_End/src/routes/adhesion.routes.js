import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createAdhesionCheckout,
  createDonationCheckout,
  getAdhesionCheckoutDetails,
  checkUserAdhesionStatus
} from "../controllers/adhesion/adhesionCheckoutController.js";

const router = express.Router();

// Routes pour l'adhésion
router.post("/checkout", authMiddleware, createAdhesionCheckout);

// Routes pour les dons
router.post("/donation/checkout", authMiddleware, createDonationCheckout);

// Route pour récupérer les détails d'un checkout
router.get("/checkout/:checkoutIntentId", authMiddleware, getAdhesionCheckoutDetails);

// Route pour vérifier le statut d'adhésion
router.get("/status/:utilisateurId", authMiddleware, checkUserAdhesionStatus);

export default router;
