import { checkParticipationService, participerEvenementService } from "../../services/evenements/index.js";

/**
 * @desc    Vérifier la participation d'un utilisateur à un événement
 * @method  GET
 * @route   /evenements/:id/participation
 */
const checkParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id; // Use req.user.id in a real app
    // const utilisateurId = 1; // For test

    const participation = await checkParticipationService(id, utilisateurId);

    res.status(200).json({
      participation: participation
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la participation:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la vérification de la participation.",
      error: error.message
    });
  }
};

/**
 * @desc    Participer à un événement
 * @method  POST
 * @route   /evenements/:id/participer
 */
const participerEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id; // Use req.user.id in a real app
    // const utilisateurId = 1; // For test

    const participation = await participerEvenementService(id, utilisateurId);

    res.status(201).json({
      message: "Participation confirmée avec succès.",
      participation
    });
  } catch (error) {
    console.error("Erreur lors de la participation:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la participation à l'événement.",
      error: error.message
    });
  }
};

export { participerEvenement, checkParticipation }; 