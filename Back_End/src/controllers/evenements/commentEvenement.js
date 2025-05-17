import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter un commentaire sur un événement
 * @method  POST
 * @route   /evenements/:id/comment
 */
const addCommentEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenu } = req.body;
    const utilisateurId = req.user.id;
    //const utilisateurId = 5;

    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evenement) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Créer le commentaire
    const commentaire = await prisma.commentaireEvenement.create({
      data: {
        evenementId: parseInt(id),
        utilisateurId: utilisateurId,
        contenu
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.status(201).json({
      message: "Commentaire ajouté avec succès.",
      commentaire
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    res.status(500).json({
      message: "Erreur lors de l'ajout du commentaire.",
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un commentaire sur un événement
 * @method  DELETE
 * @route   /evenements/:id/comment/:commentId
 */
const deleteCommentEvenement = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const utilisateurId = req.user.id;

    // Vérifier si le commentaire existe et appartient à l'utilisateur
    const commentaire = await prisma.commentaireEvenement.findFirst({
      where: {
        id: parseInt(commentId),
        evenementId: parseInt(id),
        utilisateurId: utilisateurId
      }
    });

    if (!commentaire) {
      return res.status(404).json({ message: "Commentaire non trouvé ou non autorisé." });
    }

    // Supprimer le commentaire
    await prisma.commentaireEvenement.delete({
      where: { id: parseInt(commentId) }
    });

    res.status(200).json({ message: "Commentaire supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression du commentaire.",
      error: error.message
    });
  }
};

export { addCommentEvenement, deleteCommentEvenement }; 