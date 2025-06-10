import { createArticleService } from "../../services/article/articleService.js";

/**
 * @desc    Créer un nouvel article
 * @method  POST
 * @route   /articles
 */
const createArticle = async (req, res) => {
  try {
    const { titre, contenu, auteur, revueId } = req.body;
    
    //const createdBy = req.user.id;
    const createdBy = 1;

    if (!createdBy) {
      return res.status(401).json({
        message: "Utilisateur non authentifié."
      });
    }

    const article = await createArticleService({
      titre,
      contenu,
      auteur,
      revueId,
      createdBy
    });

    res.status(201).json({
      message: "Article créé avec succès.",
      article
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

export { createArticle }; 