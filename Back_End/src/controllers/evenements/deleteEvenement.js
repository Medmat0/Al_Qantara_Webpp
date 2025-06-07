import { deleteEvenementService } from "../../services/evenements/index.js";

/**
 * @desc    Supprimer un événement
 * @method  DELETE
 * @route   /evenements/:id
 */
const deleteEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id; // Use req.user.id in a real app
    // const utilisateurId = 1; // For test

    const result = await deleteEvenementService(id, utilisateurId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la suppression de l'événement.",
      error: error.message
    });
  }
};

export { deleteEvenement }; 