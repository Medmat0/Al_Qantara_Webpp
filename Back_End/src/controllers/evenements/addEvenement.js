import { addEvenementService, getCloudinarySignatureService } from "../../services/evenements/index.js";

/**
 * @desc    Obtenir la signature Cloudinary pour l'upload direct
 * @method  GET
 * @route   /evenements/cloudinary-signature
 */
const getCloudinarySignature = async (req, res) => {
  try {
    const { folder } = req.query; // Assuming folder can be passed as query param
    const signatureData = await getCloudinarySignatureService(folder || "evenements");
    res.json(signatureData);
  } catch (error) {
    console.error("Erreur lors de la génération de la signature:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

/**
 * @desc    Ajouter un événement
 * @method  POST
 * @route   /evenements
 */
const addEvenement = async (req, res) => {
  try {
    // For testing, defaultUserId is 1, in a real app, use req.user.id
    const defaultUserId = 1;
    const nouvelEvenement = await addEvenementService(req.body, defaultUserId);
    res.status(201).json({
      message: "Événement ajouté avec succès.",
      evenement: nouvelEvenement
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'événement:", error);
    res.status(500).json({
      message: error.message,
      error: error.message
    });
  }
};

export { addEvenement, getCloudinarySignature }; 