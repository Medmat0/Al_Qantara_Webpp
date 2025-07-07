import { getRevueByIdService } from "../../services/revues/revue.service.js";

/**
 * @desc    Obtenir une revue par ID (accessible à tous authentifiés)
 * @method  GET
 * @route   /revues/:id
 */
const getRevueById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const revue = await getRevueByIdService(id);
      res.status(200).json(revue);
    } catch (error) {
      res.status(500).json({ message: error.message || "Erreur lors de la récupération de la revue.", error: error.message });
    }
  };
  
  export { getRevueById };
  