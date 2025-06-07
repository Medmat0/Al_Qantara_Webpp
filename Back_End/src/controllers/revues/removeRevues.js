import { deleteRevueService } from "../../services/revues/revue.service.js";

/**
 * @desc    Supprimer une revue (Admin uniquement)
 * @method  DELETE
 * @route   /revues/:id
 */
const deleteRevue = async (req, res) => {
  try {
    const result = await deleteRevueService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      message: error.message || "Erreur lors de la suppression.", 
      error: error.message,
    });
  }
};

export { deleteRevue };
  