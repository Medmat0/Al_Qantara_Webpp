import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import {
  sAbonnerNewsletter,
  envoyerNewsletterController,
  seDesinscrireNewsletter,
  getAbonnesController,
  getHistoriqueController,
  getStatutAbonnement,
  supprimerNewsletter,
  changerStatutNewsletter
} from "../controllers/newsletter/newsletterController.js";

const router = express.Router();

// Route publique pour s'abonner
router.post("/s-abonner", sAbonnerNewsletter);

// Route pour vérifier le statut d'abonnement
router.get("/statut/:utilisateurId", getStatutAbonnement);

// Route pour se désinscrire
router.delete("/desinscription/:utilisateurId", seDesinscrireNewsletter);

// Routes protégées (admin uniquement)


router.post("/envoyer", authMiddleware, isAdmin, envoyerNewsletterController);
router.get("/abonnes", authMiddleware, isAdmin, getAbonnesController);
router.get("/historique", authMiddleware, isAdmin, getHistoriqueController);

router.delete("/:newsletterId", authMiddleware, isAdmin, supprimerNewsletter);  
router.patch("/:newsletterId/statut", authMiddleware, isAdmin, changerStatutNewsletter);

export default router; 