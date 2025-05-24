import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir un événement par son ID
 * @method  GET
 * @route   /evenements/:id
 */
const getEvenementById = async (req, res) => {
  try {
    const { id } = req.params;

    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) },
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
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Calculer les moyennes des notes
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

    res.status(200).json(evenementAvecStats);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'événement.",
      error: error.message
    });
  }
};

export { getEvenementById }; 