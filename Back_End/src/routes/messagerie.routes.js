import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import {
  envoyerMessage,
  getConversation,
  getConversations,
  supprimerMessage,
  marquerMessagesLus,
  getUtilisateurs
} from "../controllers/messagerie/messageController.js";

import {
  markUserOnline,
  markUserOffline,
  markUserInactive,
  getUsersOnlineStatus,
  updateUserActivity, getUserOnlineStatus
} from "../controllers/messagerie/onlineStatusController.js";

const router = express.Router();

// Routes pour les tests (sans authentification)
/*router.post("/test", envoyerMessage);
router.get("/test/conversations", getConversations);
router.get("/test/conversation/:utilisateurId", getConversation);
router.delete("/test/:id", supprimerMessage);
router.post("/test/marquer-lus", marquerMessagesLus);
router.get("/test/utilisateurs", getUtilisateurs);

// Routes pour le statut en ligne (tests)
router.post("/test/online-status/online", markUserOnline);
router.post("/test/online-status/offline", markUserOffline);
router.post("/test/online-status/inactive", markUserInactive);
router.get("/test/online-status/users", getUsersOnlineStatus);
router.post("/test/online-status/activity", updateUserActivity);
*/

// Routes protégées (avec authentification)
router.post("/", authMiddleware, envoyerMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversation/:utilisateurId", authMiddleware, getConversation);
router.delete("/:id", authMiddleware, supprimerMessage);
router.post("/vu", authMiddleware, marquerMessagesLus);
router.get("/utilisateurs", authMiddleware, getUtilisateurs);
router.get("/online-status/users/:userId", authMiddleware, getUserOnlineStatus);

export default router; 