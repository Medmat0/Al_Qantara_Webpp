import {
  addEvenementService,
  deleteEvenementService,
  getEvenementsService,
  getEvenementByIdService,
  toggleLikeEvenementService,
  addCommentEvenementService,
  deleteCommentEvenementService,
  rateEvenementService,
  getEvenementRatingsService,
  shareEvenementService,
  getCloudinarySignatureService
} from "../../services/evenements/index.js";


export const getCloudinarySignature = async (req, res) => {
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

// Ajouter un événement
export const addEvenement = async (req, res) => {
  try {
    const utilisateurId = req.user.id;
    const nouvelEvenement = await addEvenementService(req.body, utilisateurId);
    res.status(201).json({
      message: "Événement ajouté avec succès.",
      evenement: nouvelEvenement
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Supprimer un événement
export const deleteEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id;
    const result = await deleteEvenementService(id, utilisateurId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Récupérer tous les événements
export const getEvenements = async (req, res) => {
  try {
    const evenements = await getEvenementsService();
    res.status(200).json(evenements);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Récupérer un événement par ID
export const getEvenementById = async (req, res) => {
  try {
    const { id } = req.params;
    const evenement = await getEvenementByIdService(id);
    res.status(200).json(evenement);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Like/Unlike un événement
export const toggleLikeEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id;
    const result = await toggleLikeEvenementService(id, utilisateurId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Ajouter un commentaire
export const addCommentEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenu } = req.body;
    const utilisateurId = req.user.id;
    const commentaire = await addCommentEvenementService(id, contenu, utilisateurId);
    res.status(201).json({
      message: "Commentaire ajouté avec succès.",
      commentaire
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Supprimer un commentaire
export const deleteCommentEvenement = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const utilisateurId = req.user.id;
    const result = await deleteCommentEvenementService(id, commentId, utilisateurId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Noter un événement
export const rateEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteOrganisateur, noteLieu, noteAmbiance, noteEvenement, commentaire } = req.body;
    const utilisateurId = req.user.id;
    const rating = await rateEvenementService(id, { noteOrganisateur, noteLieu, noteAmbiance, noteEvenement, commentaire }, utilisateurId);
    res.status(201).json({
      message: "Note ajoutée avec succès.",
      rating
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Récupérer les notes d'un événement
export const getEvenementRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getEvenementRatingsService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message, error: error.message });
  }
};

// Partager un événement
export const shareEvenement = async (req, res) => {
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
    res.status(500).json({ message: error.message, error: error.message });
  }
}; 