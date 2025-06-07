import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Supprimer un événement et ses données associées (Service Logic)
 * @param {string} evenementId - ID of the event to delete.
 * @param {number} utilisateurId - ID of the user attempting to delete.
 * @returns {Promise<object>} Confirmation message.
 */
const deleteEvenementService = async (evenementId, utilisateurId) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) }
    });

    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    // Vérifier si l'utilisateur est le créateur de l'événement ou un admin
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId }
    });

    if (!utilisateur || (utilisateur.role !== "ADMIN" && evenement.createdBy !== utilisateurId)) {
      throw new Error("Vous n'êtes pas autorisé à supprimer cet événement.");
    }

    // Supprimer toutes les relations associées
    await prisma.$transaction([
      prisma.likeEvenement.deleteMany({
        where: { evenementId: parseInt(evenementId) }
      }),
      prisma.commentaireEvenement.deleteMany({
        where: { evenementId: parseInt(evenementId) }
      }),
      prisma.ratingEvenement.deleteMany({
        where: { evenementId: parseInt(evenementId) }
      }),
      prisma.partageEvenement.deleteMany({
        where: { evenementId: parseInt(evenementId) }
      }),
      prisma.participationEvenement.deleteMany({
        where: { evenementId: parseInt(evenementId) }
      }),
      prisma.accesEvenement.deleteMany({
        where: { evenementId: parseInt(evenementId) }
      })
    ]);

    // Supprimer l'événement
    await prisma.evenement.delete({
      where: { id: parseInt(evenementId) }
    });

    return { message: "Événement supprimé avec succès." };
  } catch (error) {
    throw error;
  }
};

export { deleteEvenementService }; 