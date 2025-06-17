import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";
const prisma = new PrismaClient();

const deleteOffre = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupération des candidatures associées à l'offre
    const candidatures = await prisma.candidature.findMany({
      where: { offreId: parseInt(id) }
    });

    // Suppression de chaque CV sur Cloudinary
    for (const candidature of candidatures) {
      if (candidature.cv) {
        const publicId = candidature.cv.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      }
    }

    await prisma.offre.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Offre et candidatures supprimées avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'offre.",
      error: error.message,
    });
  }
};

export { deleteOffre };