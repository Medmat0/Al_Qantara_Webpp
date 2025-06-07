import { getRevuesService } from "../../services/revues/revue.service.js";

/**
 * @desc    Obtenir toutes les revues (accessible à tous)
 * @method  GET
 * @route   /revues
 */
const getRevues = async (req, res) => {
  try {
    const revues = await getRevuesService();
    res.status(200).json(revues);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur lors de la récupération des revues.", error: error.message });
  }
};

export { getRevues };
