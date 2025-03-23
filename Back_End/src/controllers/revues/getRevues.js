import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir toutes les revues (accessible à tous)
 * @method  GET
 * @route   /revues
 */
const getRevues = async (req, res) => {
  try {
    const revues = await prisma.revue.findMany({
      select: {
        id: true,
        titre: true,
        description: true,
        mois: true,
        annee: true,
        document: true, // URL du fichier PDF sur Cloudinary
      },
      orderBy: { annee: "desc" },
    });

    res.status(200).json(revues);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des revues.", error: error.message });
  }
};

export  {getRevues};
