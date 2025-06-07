import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir un événement par son ID (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @returns {Promise<object>} The event with aggregated stats.
 */
const getEvenementByIdService = async (evenementId) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) },
      include: {
        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        likes: {
          select: {
            id: true,
            utilisateurId: true
          }
        },
        comments: {
          select: {
            id: true,
            contenu: true,
            dateCommentaire: true,
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true
              }
            }
          },
          orderBy: {
            dateCommentaire: 'desc'
          }
        },
        ratings: {
          select: {
            id: true,
            noteOrganisateur: true,
            noteLieu: true,
            noteAmbiance: true,
            noteEvenement: true,
            commentaire: true,
            dateRating: true,
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true
              }
            }
          }
        }
      }
    });

    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    const ratings = evenement.ratings;
    const totalRatings = ratings.length;
    
    const moyennes = totalRatings > 0 ? {
      noteOrganisateur: ratings.reduce((acc, curr) => acc + curr.noteOrganisateur, 0) / totalRatings,
      noteLieu: ratings.reduce((acc, curr) => acc + curr.noteLieu, 0) / totalRatings,
      noteAmbiance: ratings.reduce((acc, curr) => acc + curr.noteAmbiance, 0) / totalRatings,
      noteEvenement: ratings.reduce((acc, curr) => acc + curr.noteEvenement, 0) / totalRatings
    } : null;

    const evenementAvecStats = {
      ...evenement,
      moyennes,
      nombreLikes: evenement.likes.length,
      nombreCommentaires: evenement.comments.length,
      nombreRatings: totalRatings
    };

    return evenementAvecStats;
  } catch (error) {
    throw error;
  }
};

export { getEvenementByIdService }; 