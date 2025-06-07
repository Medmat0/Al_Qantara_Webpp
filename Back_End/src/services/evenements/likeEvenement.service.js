import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter/Retirer un like sur un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {number} utilisateurId - ID of the user liking/unliking.
 * @returns {Promise<object>} Confirmation message.
 */
const toggleLikeEvenementService = async (evenementId, utilisateurId) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) }
    });
    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    const existingLike = await prisma.likeEvenement.findFirst({
      where: {
        evenementId: parseInt(evenementId),
        utilisateurId: utilisateurId
      }
    });

    if (existingLike) {
      await prisma.likeEvenement.delete({
        where: { id: existingLike.id }
      });
      return { message: "Like retiré avec succès." };
    } else {
      await prisma.likeEvenement.create({
        data: {
          evenementId: parseInt(evenementId),
          utilisateurId: utilisateurId
        }
      });
      return { message: "Like ajouté avec succès." };
    }
  } catch (error) {
    throw error;
  }
};

export { toggleLikeEvenementService }; 