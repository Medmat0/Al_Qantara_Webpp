import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir tous les événements
 * @method  GET
 * @route   /evenements
 */
const getEvenements = async (req, res) => {
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
      },
      orderBy: {
        dateDebut: 'desc'
      }
    });

    // Calculer les moyennes des notes pour chaque événement
    const evenementsAvecNotes = evenements.map(evenement => {
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

    res.status(200).json(evenementsAvecNotes);
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des événements.",
      error: error.message
    });
  }
};

export { getEvenements }; 