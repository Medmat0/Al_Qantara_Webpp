import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();




/**
 * @desc    Obtenir toutes les offres de recrutement
 * @method  GET
 * @route   /offres
 */
const getOffres = async (req, res) => {
  try {
    const offres = await prisma.offre.findMany();
    res.status(200).json({ offres });
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des offres.",
      error: error.message,
    });
  }
};

export { getOffres };
