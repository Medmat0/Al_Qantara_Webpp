import { addCommentEvenementService, deleteCommentEvenementService } from "../../services/evenements/index.js";

/**
 * @desc    Ajouter un commentaire sur un événement
 * @method  POST
 * @route   /evenements/:id/comment
 */
const addCommentEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenu } = req.body;
    const utilisateurId = req.user.id; // Use req.user.id in a real app
    // const utilisateurId = 5; // For test

    const commentaire = await addCommentEvenementService(id, contenu, utilisateurId);
    res.status(201).json({
      message: "Commentaire ajouté avec succès.",
      commentaire
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de l'ajout du commentaire.",
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un commentaire sur un événement
 * @method  DELETE
 * @route   /evenements/:id/comment/:commentId
 */
const deleteCommentEvenement = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const utilisateurId = req.user.id; // Use req.user.id in a real app

    const result = await deleteCommentEvenementService(id, commentId, utilisateurId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la suppression du commentaire.",
      error: error.message
    });
  }
};

export { addCommentEvenement, deleteCommentEvenement }; 