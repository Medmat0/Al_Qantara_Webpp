import { getAllArticlesService } from "../../services/article/articleService.js";

/**
 * @desc    Obtenir tous les articles
 * @method  GET
 * @route   /articles
 */
const getAllArticles = async (req, res) => {
  try {
    const articles = await getAllArticlesService();
    res.json({
      message: "Articles récupérés avec succès.",
      articles
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

export { getAllArticles }; 