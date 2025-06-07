import { getEvenementsService } from "../../services/evenements/index.js";

/**
 * @desc    Obtenir tous les événements
 * @method  GET
 * @route   /evenements
 */
const getEvenements = async (req, res) => {
  try {
    const evenements = await getEvenementsService();
    res.status(200).json(evenements);
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la récupération des événements.",
      error: error.message
    });
  }
};

export { getEvenements }; 