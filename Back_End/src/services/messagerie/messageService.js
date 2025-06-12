import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Envoyer un message
 * @param {object} messageData - Données du message
 * @returns {Promise<object>} Le message créé
 */
const envoyerMessageService = async (messageData) => {
  try {
    const {
      expediteurId,
      destinataireId,
      contenu,
      type,
      evenementId,
      piecesJointes
    } = messageData;

    // Vérifier si l'expéditeur et le destinataire existent
    const [expediteur, destinataire] = await Promise.all([
      prisma.utilisateur.findUnique({ where: { id: expediteurId } }),
      prisma.utilisateur.findUnique({ where: { id: destinataireId } })
    ]);

    if (!expediteur || !destinataire) {
      throw new Error("Expéditeur ou destinataire non trouvé.");
    }

    // Si c'est un message d'événement, vérifier que l'événement existe
    if (type === 'EVENEMENT' && evenementId) {
      const evenement = await prisma.evenement.findUnique({
        where: { id: evenementId }
      });
      if (!evenement) {
        throw new Error("Événement non trouvé.");
      }
    }

    // Calculer la date d'expiration (24h après l'envoi)
    const dateExpiration = new Date();
    dateExpiration.setHours(dateExpiration.getHours() + 24);

    // Créer le message
    const message = await prisma.message.create({
      data: {
        contenu,
        type,
        dateExpiration,
        expediteurId,
        destinataireId,
        evenementId,
        piecesJointes: piecesJointes ? {
          create: piecesJointes.map(pj => ({
            type: pj.type,
            url: pj.url
          }))
        } : undefined
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoProfil: true
          }
        },
        destinataire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoProfil: true
          }
        },
        evenement: true,
        piecesJointes: true
      }
    });

    return message;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Récupérer la conversation entre deux utilisateurs
 * @param {number} utilisateurId - ID de l'utilisateur connecté
 * @param {number} autreUtilisateurId - ID de l'autre utilisateur
 * @returns {Promise<Array>} Liste des messages
 */
const getConversationService = async (utilisateurId, autreUtilisateurId) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            AND: [
              { expediteurId: utilisateurId },
              { destinataireId: autreUtilisateurId }
            ]
          },
          {
            AND: [
              { expediteurId: autreUtilisateurId },
              { destinataireId: utilisateurId }
            ]
          }
        ],
        dateExpiration: {
          gt: new Date()
        }
      },
      orderBy: {
        dateEnvoi: 'asc'
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoProfil: true
          }
        },
        destinataire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoProfil: true
          }
        },
        evenement: true,
        piecesJointes: true
      }
    });

    // Marquer les messages non lus comme lus
    await prisma.message.updateMany({
      where: {
        destinataireId: utilisateurId,
        expediteurId: autreUtilisateurId,
        estLu: false
      },
      data: {
        estLu: true
      }
    });

    return messages;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Récupérer la liste des conversations
 * @param {number} utilisateurId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des conversations
 */
const getConversationsService = async (utilisateurId) => {
  try {
    // Récupérer les derniers messages de chaque conversation
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { expediteurId: utilisateurId },
          { destinataireId: utilisateurId }
        ],
        dateExpiration: {
          gt: new Date()
        }
      },
      orderBy: {
        dateEnvoi: 'desc'
      },
      include: {
        expediteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoProfil: true
          }
        },
        destinataire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            photoProfil: true
          }
        },
        evenement: true,
        piecesJointes: true
      }
    });

    // Grouper les conversations par utilisateur
    const conversationsMap = new Map();
    conversations.forEach(message => {
      const autreUtilisateurId = message.expediteurId === utilisateurId
        ? message.destinataireId
        : message.expediteurId;

      if (!conversationsMap.has(autreUtilisateurId)) {
        conversationsMap.set(autreUtilisateurId, {
          utilisateur: message.expediteurId === utilisateurId
            ? message.destinataire
            : message.expediteur,
          dernierMessage: message,
          nonLus: 0
        });
      }
    });

    // Compter les messages non lus
    const messagesNonLus = await prisma.message.groupBy({
      by: ['expediteurId'],
      where: {
        destinataireId: utilisateurId,
        estLu: false,
        dateExpiration: {
          gt: new Date()
        }
      },
      _count: true
    });

    messagesNonLus.forEach(({ expediteurId, _count }) => {
      const conversation = conversationsMap.get(expediteurId);
      if (conversation) {
        conversation.nonLus = _count;
      }
    });

    return Array.from(conversationsMap.values());
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Supprimer un message
 * @param {number} messageId - ID du message
 * @param {number} utilisateurId - ID de l'utilisateur
 * @returns {Promise<object>} Message de confirmation
 */
const supprimerMessageService = async (messageId, utilisateurId) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error("Message non trouvé.");
    }

    if (message.expediteurId !== utilisateurId) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce message.");
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return { message: "Message supprimé avec succès." };
  } catch (error) {
    throw error;
  }
};

export {
  envoyerMessageService,
  getConversationService,
  getConversationsService,
  supprimerMessageService
}; 