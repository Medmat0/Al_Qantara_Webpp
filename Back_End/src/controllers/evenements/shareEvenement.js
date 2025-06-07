import { shareEvenementService } from "../../services/evenements/index.js";

/**
 * @desc    Partager un événement avec un contact
 * @method  POST
 * @route   /evenements/:id/share
 */
const shareEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailDestinataire, message } = req.body;
    const utilisateurId = req.user.id;

    const partage = await shareEvenementService(id, emailDestinataire, message, utilisateurId);

    res.status(201).json({
      message: "Événement partagé avec succès.",
      partage
    });
  } catch (error) {
    console.error("Erreur lors du partage de l'événement:", error);
    res.status(500).json({
      message: error.message || "Erreur lors du partage de l'événement.",
      error: error.message
    });
  }
};

export { shareEvenement }; 