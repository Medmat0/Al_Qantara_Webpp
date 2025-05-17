import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Se désinscrire d'un événement
 * @method  DELETE
 * @route   /evenements/:id/desinscription
 */
const desinscriptionEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id;
    //const utilisateurId = 1; // Pour test

    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evenement) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Vérifier si l'utilisateur est inscrit
    const participation = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(id),
          utilisateurId: utilisateurId
        }
      }
    });

    if (!participation) {
      return res.status(400).json({ message: "Vous n'êtes pas inscrit à cet événement." });
    }

    // Supprimer la participation
    await prisma.participationEvenement.delete({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(id),
          utilisateurId: utilisateurId
        }
      }
    });

    // Mettre à jour le nombre de places restantes
    if (evenement.placesRestantes !== null) {
      await prisma.evenement.update({
        where: { id: parseInt(id) },
        data: {
          placesRestantes: evenement.placesRestantes + 1
        }
      });
    }

    res.status(200).json({
      message: "Désinscription effectuée avec succès."
    });
  } catch (error) {
    console.error("Erreur lors de la désinscription:", error);
    res.status(500).json({
      message: "Erreur lors de la désinscription de l'événement.",
      error: error.message
    });
  }
};

export { desinscriptionEvenement }; 