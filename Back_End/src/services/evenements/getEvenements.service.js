import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir tous les événements avec statistiques (Service Logic)
 * @returns {Promise<Array>} List of events with aggregated stats.
 */
const getEvenementsService = async () => {
  try {
    const evenements = await prisma.evenement.findMany({
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
            utilisateurId: true,
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true
              }
            }
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
        },
        participations: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                photoProfil: true
              }
            }
          }
        }
      },
      orderBy: {
        dateDebut: 'desc'
      }
    });

    const evenementsAvecStats = evenements.map(evenement => {
      const ratings = evenement.ratings;
      const totalRatings = ratings.length;

      const moyennes = totalRatings > 0 ? {
        noteOrganisateur: ratings.reduce((acc, curr) => acc + curr.noteOrganisateur, 0) / totalRatings,
        noteLieu: ratings.reduce((acc, curr) => acc + curr.noteLieu, 0) / totalRatings,
        noteAmbiance: ratings.reduce((acc, curr) => acc + curr.noteAmbiance, 0) / totalRatings,
        noteEvenement: ratings.reduce((acc, curr) => acc + curr.noteEvenement, 0) / totalRatings
      } : null;

      return {
        ...evenement,
        moyennes,
        nombreLikes: evenement.likes.length,
        nombreCommentaires: evenement.comments.length,
        nombreRatings: totalRatings
      };
    });

    return evenementsAvecStats;
  } catch (error) {
    throw error;
  }
};

export { getEvenementsService };
