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
    const status = error.status || 500;
    console.error("Error fetching offer by ID:", error);
    res.status(status).json({
      message: error.message || "Erreur lors de la récupération de l'offre.",
    });
  }
};

export {  getOffreById }; 