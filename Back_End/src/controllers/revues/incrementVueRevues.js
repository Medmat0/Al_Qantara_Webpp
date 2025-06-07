import { incrementVueService, incrementTelechargementService } from "../../services/revues/revue.service.js";

/**
 * @desc    Ajouter vue pour chaque revue 
 * @method  POST
 * @route   /revues/:id/view
 */
const incrementVue = async (req, res) => {
  const revueId = parseInt(req.params.id);

  try {
    const result = await incrementVueService(revueId);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Erreur lors de l'incrémentation des vues", error: err.message });
  }
};

/**
 * @desc    Ajouter telechargement pour chaque revue 
 * @method  POST
 * @route   /revues/:id/download
 */
const incrementTelechargement = async (req, res) => {
  const revueId = parseInt(req.params.id);
  try {
    const result = await incrementTelechargementService(revueId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Erreur lors de l'incrémentation des téléchargements", error: err.message });
  }
};

export { incrementVue, incrementTelechargement };