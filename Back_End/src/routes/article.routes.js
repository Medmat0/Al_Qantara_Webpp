import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import {
  createArticle,
  getArticleById,
  getAllArticles,
  getArticlesByRevue,
  updateArticle,
  deleteArticle,
} from "../controllers/article/index.js";

const router = express.Router();

// Routes publiques
router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.get("/revue/:revueId", getArticlesByRevue);

// Routes protégées
router.post("/", createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

export default router; 