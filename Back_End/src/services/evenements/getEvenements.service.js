import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir tous les événements (Service Logic)
 * @returns {Promise<object[]>} List of events.
 */
const getEvenementsService = async () => {
  try {
    const evenements = await prisma.evenement.findMany({
      select: {
        id: true,
        titre: true,
        description: true,
        dateDebut: true,
        dateFin: true,
        lieu: true,
        type: true,
        images: true,
        video: true,
        latitude: true,
        longitude: true,
        placesTotal: true,
        placesRestantes: true,
        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });
    return evenements;
  } catch (error) {
    throw error;
  }
};

export { getEvenementsService }; 