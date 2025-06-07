import { getEvenementByIdService } from "../../services/evenements/index.js";

/**
 * @desc    Obtenir un événement par son ID
 * @method  GET
 * @route   /evenements/:id
 */
const getEvenementById = async (req, res) => {
  try {
    const { id } = req.params;
    const evenement = await getEvenementByIdService(id);
    res.status(200).json(evenement);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la récupération de l'événement.",
      error: error.message
    });
  }
};

export { getEvenementById }; 