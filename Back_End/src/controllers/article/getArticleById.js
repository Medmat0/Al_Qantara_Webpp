import { getArticleByIdService } from "../../services/article/articleService.js";

/**
 * @desc    Obtenir un article par son ID
 * @method  GET
 * @route   /articles/:id
 */
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await getArticleByIdService(Number(id));

    if (!article) {
      return res.status(404).json({
        message: "Article non trouvé."
      });
    }

    res.json({
      message: "Article récupéré avec succès.",
      article
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

export { getArticleById }; 