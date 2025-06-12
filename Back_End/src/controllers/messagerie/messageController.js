import {
  envoyerMessageService,
  getConversationService,
  getConversationsService,
  supprimerMessageService
} from "../../services/messagerie/messageService.js";

/**
 * @desc    Envoyer un message
 * @method  POST
 * @route   /messages
 */
const envoyerMessage = async (req, res) => {
  try {
    const { destinataireId, contenu, type, evenementId, piecesJointes } = req.body;
    
    // Pour les tests, on utilise l'ID de l'utilisateur depuis le body
    const expediteurId = req.body.expediteurId || req.user?.id;

    if (!expediteurId) {
      return res.status(400).json({
        message: "ID de l'expéditeur manquant"
      });
    }

    if (!destinataireId || !contenu) {
      return res.status(400).json({
        message: "Destinataire et contenu requis"
      });
    }

    const message = await envoyerMessageService({
      expediteurId,
      destinataireId,
      contenu,
      type: type || 'TEXTE',
      evenementId,
      piecesJointes
    });

    // Envoyer une notification en temps réel si le destinataire est connecté
    const destinataireSocketId = req.userSockets.get(destinataireId);
    if (destinataireSocketId) {
      req.io.to(destinataireSocketId).emit('nouveauMessage', {
        message,
        expediteur: {
          id: expediteurId,
          nom: req.body.expediteurNom || 'Test User',
          prenom: req.body.expediteurPrenom || 'Test'
        }
      });
    }

    res.status(201).json({
      message: "Message envoyé avec succès",
      data: message
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi du message",
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer la conversation avec un utilisateur
 * @method  GET
 * @route   /messages/conversation/:utilisateurId
 */
const getConversation = async (req, res) => {
  try {
    const { utilisateurId } = req.params;
    // Pour les tests, on accepte currentUserId via query ou body
    const currentUserId = req.query.currentUserId || req.body.currentUserId || req.user?.id;

    if (!currentUserId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    const messages = await getConversationService(Number(currentUserId), parseInt(utilisateurId));
    res.status(200).json({
      message: "Conversation récupérée avec succès",
      data: messages
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la conversation:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de la conversation",
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer la liste des conversations
 * @method  GET
 * @route   /messages/conversations
 */
const getConversations = async (req, res) => {
  try {
    // Pour les tests, on accepte currentUserId via query ou body
    const currentUserId = req.query.currentUserId || req.body.currentUserId || req.user?.id;

    if (!currentUserId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    const conversations = await getConversationsService(Number(currentUserId));
    res.status(200).json({
      message: "Conversations récupérées avec succès",
      data: conversations
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des conversations",
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un message
 * @method  DELETE
 * @route   /messages/:id
 */
const supprimerMessage = async (req, res) => {
  try {
    const { id } = req.params;
    // Pour les tests, on accepte currentUserId via query ou body
    const currentUserId = req.query.currentUserId || req.body.currentUserId || req.user?.id;

    if (!currentUserId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    await supprimerMessageService(parseInt(id), Number(currentUserId));
    res.status(200).json({
      message: "Message supprimé avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du message:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression du message",
      error: error.message
    });
  }
};

export {
  envoyerMessage,
  getConversation,
  getConversations,
  supprimerMessage
}; 