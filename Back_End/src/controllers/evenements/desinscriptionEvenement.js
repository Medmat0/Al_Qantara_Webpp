import { desinscriptionEvenementService } from "../../services/evenements/index.js";

/**
 * @desc    Se désinscrire d'un événement
 * @method  DELETE
 * @route   /evenements/:id/desinscription
 */
const desinscriptionEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    //const utilisateurId = req.user.id; // Use req.user.id in a real app
     const utilisateurId = 1; // For test

    const result = await desinscriptionEvenementService(id, utilisateurId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la désinscription:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la désinscription de l'événement.",
      error: error.message
    });
  }
};

export { desinscriptionEvenement }; 