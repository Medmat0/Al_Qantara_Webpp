import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Vérifier la participation d'un utilisateur à un événement via QR code (Service Logic)
 * @param {number} evenementId - ID de l'événement
 * @param {number} utilisateurId - ID de l'utilisateur
 * @returns {Promise<object>} Détails de la participation
 */
const checkQRCodeParticipationService = async (evenementId, utilisateurId) => {
  try {
    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: evenementId }
    });
    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    // Vérifier la participation de l'utilisateur
    const participation = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId,
          utilisateurId
        }
      },
      include: {
        evenement: {
          select: {
            titre: true,
            dateDebut: true,
            lieu: true,
            latitude: true,
            longitude: true
          }
        },
        utilisateur: {
          select: { nom: true, prenom: true, email: true }
        }
      }
    });

    if (!participation) {
      throw new Error("Participation non trouvée pour cet utilisateur à cet événement.");
    }

    return participation;
  } catch (error) {
    throw error;
  }
};

export { checkQRCodeParticipationService }; 