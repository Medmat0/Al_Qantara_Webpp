import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



/**
 * @desc    Supprimer une offre de recrutement
 * @method  DELETE
 * @route   /offres/:id
 */
const deleteOffre = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.offre.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Offre supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre:", error);
    res.status(500).json({
      message: "Erreur lors de la suppression de l'offre.",
      error: error.message,
    });
  }
};

export { deleteOffre };
