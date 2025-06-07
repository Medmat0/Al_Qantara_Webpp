import { toggleLikeEvenementService } from "../../services/evenements/index.js";

/**
 * @desc    Ajouter/Retirer un like sur un événement
 * @method  POST
 * @route   /evenements/:id/like
 */
const toggleLikeEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    // const utilisateurId = req.user.id; // Use req.user.id in a real app
    const utilisateurId = 5; // For test

    const result = await toggleLikeEvenementService(id, utilisateurId);
    res.status(200).json(result);

  } catch (error) {
    console.error("Erreur lors de la gestion du like:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la gestion du like.",
      error: error.message
    });
  }
};

export { toggleLikeEvenement }; 