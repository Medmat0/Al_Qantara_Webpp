import express from "express";
//import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  envoyerMessage,
  getConversation,
  getConversations,
  supprimerMessage
} from "../controllers/messagerie/messageController.js";

const router = express.Router();

// Routes pour les tests (sans authentification)
router.post("/test", envoyerMessage);
router.get("/test/conversations", getConversations);
router.get("/test/conversation/:utilisateurId", getConversation);
router.delete("/test/:id", supprimerMessage);

// Routes protégées (avec authentification)
/*router.post("/", authMiddleware, envoyerMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversation/:utilisateurId", authMiddleware, getConversation);
router.delete("/:id", authMiddleware, supprimerMessage); */ 

export default router; 