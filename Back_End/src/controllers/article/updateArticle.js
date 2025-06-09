import { updateArticleService } from "../../services/article/articleService.js";

/**
 * @desc    Mettre à jour un article
 * @method  PUT
 * @route   /articles/:id
 */
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, contenu, auteur, statut } = req.body;
    const userId = req.user.id;

    const article = await updateArticleService(Number(id), {
      titre,
      contenu,
      auteur,
      statut
    }, userId);

    if (!article) {
      return res.status(404).json({
        message: "Article non trouvé."
      });
    }

    res.json({
      message: "Article mis à jour avec succès.",
      article
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

export { updateArticle }; 