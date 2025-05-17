import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();

/**
 * @desc    Supprimer un événement
 * @method  DELETE
 * @route   /evenements/:id
 */
const deleteEvenement = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evenement) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Supprimer les images de Cloudinary si elles existent
    if (evenement.images && evenement.images.length > 0) {
      for (const imageUrl of evenement.images) {
        const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Supprimer la vidéo de Cloudinary si elle existe
    if (evenement.video) {
      const publicId = evenement.video.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }

    // Supprimer toutes les relations associées
    await prisma.$transaction([
      prisma.likeEvenement.deleteMany({
        where: { evenementId: parseInt(id) }
      }),
      prisma.commentaireEvenement.deleteMany({
        where: { evenementId: parseInt(id) }
      }),
      prisma.ratingEvenement.deleteMany({
        where: { evenementId: parseInt(id) }
      }),
      prisma.partageEvenement.deleteMany({
        where: { evenementId: parseInt(id) }
      }),
      prisma.participationEvenement.deleteMany({
        where: { evenementId: parseInt(id) }
      }),
      prisma.accesEvenement.deleteMany({
        where: { evenementId: parseInt(id) }
      }),
      prisma.evenement.delete({
        where: { id: parseInt(id) }
      })
    ]);

    res.status(200).json({
      message: "Événement supprimé avec succès."
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'événement.",
      error: error.message
    });
  }
};

export { deleteEvenement }; 