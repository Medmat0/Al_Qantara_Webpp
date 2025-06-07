import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Se désinscrire d'un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {number} utilisateurId - ID of the user desubscribing.
 * @returns {Promise<object>} Confirmation message.
 */
const desinscriptionEvenementService = async (evenementId, utilisateurId) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) }
    });

    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    const participation = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(evenementId),
          utilisateurId: utilisateurId
        }
      }
    });

    if (!participation) {
      throw new Error("Vous n'êtes pas inscrit à cet événement.");
    }

    await prisma.participationEvenement.delete({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(evenementId),
          utilisateurId: utilisateurId
        }
      }
    });

    if (evenement.placesRestantes !== null) {
      await prisma.evenement.update({
        where: { id: parseInt(evenementId) },
        data: {
          placesRestantes: evenement.placesRestantes + 1
        }
      });
    }
    return { message: "Désinscription effectuée avec succès." };
  } catch (error) {
    throw error;
  }
};

export { desinscriptionEvenementService }; 