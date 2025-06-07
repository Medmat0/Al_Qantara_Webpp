import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


/**
 * @desc    Obtenir une offre de recrutement par ID
 * @method  GET
 * @route   /offres/:id
 */
const getOffreById = async (req, res) => {
  try {
    const { id } = req.params;
    const offre = await prisma.offre.findUnique({
      where: { id: parseInt(id) },
    });

    if (!offre) {
      return res.status(404).json({ message: "Offre non trouvée." });
    }

    res.status(200).json({ offre });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'offre par ID:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de l'offre.",
      error: error.message,
    });
  }
};

export {  getOffreById }; 