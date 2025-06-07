import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter un commentaire sur un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {string} contenu - Content of the comment.
 * @param {number} utilisateurId - ID of the user adding the comment.
 * @returns {Promise<object>} The newly created comment.
 */
const addCommentEvenementService = async (evenementId, contenu, utilisateurId) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) }
    });

    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    const commentaire = await prisma.commentaireEvenement.create({
      data: {
        evenementId: parseInt(evenementId),
        utilisateurId: utilisateurId,
        contenu
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });
    return commentaire;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Supprimer un commentaire sur un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {string} commentId - ID of the comment to delete.
 * @param {number} utilisateurId - ID of the user deleting the comment.
 * @returns {Promise<object>} Confirmation message.
 */
const deleteCommentEvenementService = async (evenementId, commentId, utilisateurId) => {
  try {
    const commentaire = await prisma.commentaireEvenement.findFirst({
      where: {
        id: parseInt(commentId),
        evenementId: parseInt(evenementId),
        utilisateurId: utilisateurId
      }
    });

    if (!commentaire) {
      throw new Error("Commentaire non trouvé ou non autorisé.");
    }

    await prisma.commentaireEvenement.delete({
      where: { id: parseInt(commentId) }
    });
    return { message: "Commentaire supprimé avec succès." };
  } catch (error) {
    throw error;
  }
};

export { addCommentEvenementService, deleteCommentEvenementService }; 