import { deleteArticleService } from "../../services/article/articleService.js";

/**
 * @desc    Supprimer un article
 * @method  DELETE
 * @route   /articles/:id
 */
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    //const userId = req.user.id; 
    const userId = 1;

    const article = await deleteArticleService(Number(id), userId);

    if (!article) {
      return res.status(404).json({
        message: "Article non trouvé."
      });
    }

    res.json({
      message: "Article supprimé avec succès.",
      article
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

export { deleteArticle }; 