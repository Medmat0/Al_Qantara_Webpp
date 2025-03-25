import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";


const prisma = new PrismaClient();
/**
 * @desc    Supprimer une revue (Admin uniquement)
 * @method  DELETE
 * @route   /revues/:id
 */
const deleteRevue = async (req, res) => {
  try {
    const { id } = req.params;

    const revue = await prisma.revue.findUnique({ where: { id: parseInt(id) } });
    if (!revue) {
      return res.status(404).json({ message: "Revue non trouvée." });
    }

    const fileUrl = revue.fichier || revue.document; 
    if (!fileUrl) {
      return res.status(400).json({ message: "Aucun fichier associé à cette revue." });
    }

    const publicId = fileUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`revues/${publicId}`);

    await prisma.revue.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "Revue supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la suppression.", 
      error: error.message,
      details: {
        revue: revue || null,
        fileUrl: fileUrl || null
      }
    });
  }
};

 export {deleteRevue}
  