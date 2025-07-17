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
    console.log("message data", messageData)
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
            photoProfil: true,
            statutEnLigne: true,
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

    // Sauvegarder les infos avant suppression
    const messageInfo = {
      destinataireId: message.destinataireId,
      expediteurId: message.expediteurId
    };

    await prisma.message.delete({
      where: { id: messageId }
    });

    return { 
      message: "Message supprimé avec succès.",
      ...messageInfo
    };
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Marquer les messages comme lus
 * @param {number} expediteurId - ID de l'expéditeur
 * @param {number} destinataireId - ID du destinataire
 * @returns {Promise<object>} Messages mis à jour
 */
const marquerMessagesLusService = async (expediteurId, destinataireId) => {
  try {
    // Mettre à jour tous les messages non lus
    const messagesLus = await prisma.message.updateMany({
      where: {
        expediteurId: expediteurId,
        destinataireId: destinataireId,
        estLu: false,
        dateExpiration: {
          gt: new Date()
        }
      },
      data: {
        estLu: true
      }
    });

    return messagesLus;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Récupérer la liste des utilisateurs
 * @param {number} currentUserId - ID de l'utilisateur connecté
 * @returns {Promise<Array>} Liste des utilisateurs
 */
const getUtilisateursService = async (currentUserId) => {
  try {
    // Récupérer tous les utilisateurs sauf l'utilisateur connecté
    const utilisateurs = await prisma.utilisateur.findMany({
      where: {
        id: {
          not: currentUserId
        }
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        photoProfil: true,
        statutEnLigne: true,
        derniereActivite: true,
        _count: {
          select: {
            messagesRecus: {
              where: {
                expediteurId: currentUserId,
                estLu: false,
                dateExpiration: {
                  gt: new Date()
                }
              }
            }
          }
        }
      }
    });

    // Formater les données pour inclure le nombre de messages non lus et le statut en ligne
    return utilisateurs.map(user => ({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      photoProfil: user.photoProfil,
      statutEnLigne: user.statutEnLigne,
      derniereActivite: user.derniereActivite,
      nonLus: user._count.messagesRecus
    }));
  } catch (error) {
    throw error;
  }
};

export {
  envoyerMessageService,
  getConversationService,
  getConversationsService,
  supprimerMessageService,
  marquerMessagesLusService,
  getUtilisateursService
}; 