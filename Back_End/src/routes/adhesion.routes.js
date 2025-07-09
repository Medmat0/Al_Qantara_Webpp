import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createAdhesionCheckout,
  createDonationCheckout,
  getAdhesionCheckoutDetails,
  checkUserAdhesionStatus,
  createAdhesion
} from "../controllers/adhesion/adhesionCheckoutController.js";
import {
  handlePaymentWebhook,
  processManualPayment
} from "../controllers/adhesion/webhookController.js";

const router = express.Router();

// Routes pour l'adhésion
router.post("/checkout", authMiddleware, createAdhesionCheckout);
router.post("/create", authMiddleware, createAdhesion);

// Routes pour les dons
router.post("/donation/checkout", authMiddleware, createDonationCheckout);

// Route pour récupérer les détails d'un checkout
router.get("/checkout/:checkoutIntentId", authMiddleware, getAdhesionCheckoutDetails);

// Route pour vérifier le statut d'adhésion
router.get("/status/:utilisateurId", authMiddleware, checkUserAdhesionStatus);

// Routes pour les webhooks et traitement des paiements
router.post("/webhook", handlePaymentWebhook);
router.post("/process-payment", authMiddleware, processManualPayment);

export default router;
