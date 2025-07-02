import express from "express";
import { authMiddleware , isAdmin } from "../middleware/auth.middleware.js";
import {
  createArticle,
  getArticleById,
  getAllArticles,
  getArticlesByRevue,
  updateArticle,
  deleteArticle,
} from "../controllers/article/index.js";
import {
  createCategorie,
  getAllCategories,
  getCategorieById,
  updateCategorie,
  deleteCategorie
} from "../controllers/article/categorieController.js";

const router = express.Router();

// Routes publiques
router.get("/", getAllArticles);
router.get("/:id", getArticleById);
router.get("/revue/:revueId", getArticlesByRevue);
router.get("/categories/all", getAllCategories);

// Routes protégées
router.use(authMiddleware);
router.use(isAdmin);
router.post("/", createArticle);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

// Routes pour les catégories
router.post("/categories", createCategorie);
router.get("/categories/:id", getCategorieById);
router.put("/categories/:id", updateCategorie);
router.delete("/categories/:id", deleteCategorie);

export default router;
