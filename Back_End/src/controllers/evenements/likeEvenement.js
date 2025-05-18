import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter/Retirer un like sur un événement
 * @method  POST
 * @route   /evenements/:id/like
 */
const toggleLikeEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    // const utilisateurId = req.user.id;
    const utilisateurId = 5;
    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) }
    });
    if (!evenement) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Vérifier si l'utilisateur a déjà liké l'événement
    const existingLike = await prisma.likeEvenement.findFirst({
      where: {
        evenementId: parseInt(id),
        utilisateurId: utilisateurId
      }
    });
    console.log(existingLike);
    if (existingLike) {
      // Retirer le like
      await prisma.likeEvenement.delete({
        where: { id: existingLike.id }
      });
      return res.status(200).json({ message: "Like retiré avec succès." });
    } else {
      // Ajouter le like
      await prisma.likeEvenement.create({
        data: {
          evenementId: parseInt(id),
          utilisateurId: utilisateurId
        }
      });
      return res.status(201).json({ message: "Like ajouté avec succès." });
    }
  } catch (error) {
    console.error("Erreur lors de la gestion du like:", error);
    res.status(500).json({
      message: "Erreur lors de la gestion du like.",
      error: error.message
    });
  }
};

export { toggleLikeEvenement }; 