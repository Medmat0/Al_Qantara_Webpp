import { getArticlesByRevueService } from "../../services/article/articleService.js";

/**
 * @desc    Obtenir tous les articles d'une revue
 * @method  GET
 * @route   /articles/revue/:revueId
 */
const getArticlesByRevue = async (req, res) => {
  try {
    const { revueId } = req.params;
    const articles = await getArticlesByRevueService(Number(revueId));
    
    res.json({
      message: "Articles de la revue récupérés avec succès.",
      articles
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des articles de la revue:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

export { getArticlesByRevue }; 