import { rateEvenementService, getEvenementRatingsService } from "../../services/evenements/index.js";

/**
 * @desc    Ajouter une note à un événement
 * @method  POST
 * @route   /evenements/:id/rate
 */
const rateEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      noteOrganisateur,
      noteLieu,
      noteAmbiance,
      noteEvenement,
      commentaire
    } = req.body;
    const utilisateurId = req.user.id;

    const rating = await rateEvenementService(id, { noteOrganisateur, noteLieu, noteAmbiance, noteEvenement, commentaire }, utilisateurId);

    res.status(201).json({
      message: "Note ajoutée avec succès.",
      rating
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la note:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de l'ajout de la note.",
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir les notes d'un événement (Admin uniquement)
 * @method  GET
 * @route   /evenements/:id/ratings
 */
const getEvenementRatings = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getEvenementRatingsService(id);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la récupération des notes.",
      error: error.message
    });
  }
};

export { rateEvenement, getEvenementRatings }; 