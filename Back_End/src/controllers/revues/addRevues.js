import { addRevueService } from "../../services/revues/revue.service.js";

/**
 * @desc    Ajouter une revue (Admin uniquement)
 * @method  POST
 * @route   /revues
 */
const addRevue = async (req, res) => {
  try {
    const revue = await addRevueService(req.body, req.file, req.user.id);
    res.status(201).json({ message: "Revue ajoutée avec succès.", revue });
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur lors de l'ajout.", error: error.message });
  }
};

export { addRevue };