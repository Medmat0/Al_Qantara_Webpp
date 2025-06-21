import {
  envoyerMessageService,
  getConversationService,
  getConversationsService,
  supprimerMessageService,
  marquerMessagesLusService,
  getUtilisateursService
} from "../../services/messagerie/messageService.js";

/**
 * @desc    Envoyer un message
 * @method  POST
 * @route   /messages
 */
const envoyerMessage = async (req, res) => {
  try {
    const { destinataireId, contenu, type, evenementId, piecesJointes } = req.body;
    
    const expediteurId = req.user?.id;
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
    const currentUserId =   req.user?.id;

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
    const currentUserId =   req.user?.id;

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
    const currentUserId =  req.user?.id;

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

/**
 * @desc    Marquer les messages comme lus
 * @method  POST
 * @route   /messages/vu
 */
const marquerMessagesLus = async (req, res) => {
  try {
    const { expediteurId } = req.body;
     const destinataireId = req.user?.id;
    
    if (!expediteurId || !destinataireId) {
      return res.status(400).json({
        message: "IDs de l'expéditeur et du destinataire requis"
      });
    }

    const messagesLus = await marquerMessagesLusService(expediteurId, destinataireId);

    // Notifier l'expéditeur que ses messages ont été lus
    const expediteurSocketId = req.userSockets.get(expediteurId);
    if (expediteurSocketId) {
      req.io.to(expediteurSocketId).emit('messageLu', {
        messageId: messagesLus.id,
        destinataireId
      });
    }

    res.status(200).json({
      message: "Messages marqués comme lus avec succès",
      data: messagesLus
    });
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus:", error);
    res.status(500).json({
      message: "Erreur lors du marquage des messages comme lus",
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer la liste des utilisateurs
 * @method  GET
 * @route   /messages/utilisateurs
 */
const getUtilisateurs = async (req, res) => {
  try {
    // Pour les tests, on accepte currentUserId via query ou body
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    const utilisateurs = await getUtilisateursService(Number(currentUserId));
    res.status(200).json({
      message: "Liste des utilisateurs récupérée avec succès",
      data: utilisateurs
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message
    });
  }
};

export {
  envoyerMessage,
  getConversation,
  getConversations,
  supprimerMessage,
  marquerMessagesLus,
  getUtilisateurs
}; 