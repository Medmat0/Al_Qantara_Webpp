import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import {
  addEvenement,
  deleteEvenement,
  getEvenements,
  getEvenementById,
  toggleLikeEvenement,
  addCommentEvenement,
  deleteCommentEvenement,
  rateEvenement,
  getEvenementRatings,
  shareEvenement,
  getCloudinarySignature
} from "../controllers/evenements/evenementController.js";
import { participerEvenement, checkParticipation, checkQRCodeParticipation } from "../controllers/evenements/participationEvenement.js";
import { desinscriptionEvenement } from "../controllers/evenements/desinscriptionEvenement.js";
import { handleHelloAssoWebhook } from "../controllers/evenements/helloAssoWebhook.js";
import { createCheckout, getCheckoutDetails } from "../controllers/evenements/checkoutController.js";
import { getCheckoutIntentController } from "../controllers/evenements/checkoutIntent.js";
import { handlePaymentWebhookController, checkPaymentStatusController } from '../controllers/evenements/paymentController.js';
import { demandeRemboursementController, listRemboursementDemandesController, updateRemboursementDemandeStatusController } from '../controllers/evenements/demandeRemboursementController.js';

const router = express.Router();

// Routes publiques
router.get("/cloudinary-signature", getCloudinarySignature);

// CRUD événements (contrôleur unique)
router.post("/", authMiddleware,isAdmin, addEvenement);
router.delete("/:id", authMiddleware, isAdmin, deleteEvenement);
router.get("/", getEvenements);
router.get("/:id", getEvenementById);

// Like
router.post("/:id/like", authMiddleware, toggleLikeEvenement);

// Commentaires
router.post("/:id/comment", authMiddleware, addCommentEvenement);
router.delete("/:id/comment/:commentId", authMiddleware, deleteCommentEvenement);

// Notation
router.post("/:id/rate", authMiddleware, rateEvenement);
router.get("/:id/ratings", authMiddleware, getEvenementRatings);

// Partage
router.post("/:id/share", authMiddleware, shareEvenement);

// Participation
router.get("/:id/participation", authMiddleware, checkParticipation);
router.post("/:id/participer", authMiddleware,participerEvenement);
router.delete("/:id/desinscription", authMiddleware,desinscriptionEvenement);
router.get("/:evenementId/qr-participation/:utilisateurId",authMiddleware, checkQRCodeParticipation);

// Paiement HelloAsso
router.post("/checkout",authMiddleware, createCheckout);
//router.get("/checkout/:checkoutIntentId", getCheckoutDetails);
//router.get("/checkout-intent/:checkoutIntentId", getCheckoutIntentController);

// Webhooks
//router.post('/webhook/helloasso', handleHelloAssoWebhook);
//router.post('/webhook', handlePaymentWebhookController);
//router.get('/payment/:paymentId/status', checkPaymentStatusController);

// Remboursement
router.post('/:id/demande-remboursement',authMiddleware ,demandeRemboursementController);
router.get('/admin/remboursements',authMiddleware,isAdmin, listRemboursementDemandesController);
router.patch('/admin/remboursements/:id',authMiddleware,isAdmin, updateRemboursementDemandeStatusController);

export default router; 