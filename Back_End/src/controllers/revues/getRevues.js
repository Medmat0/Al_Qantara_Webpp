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
        titre : true,
        nombreVues : true,
        nombreTelechargements : true,
        //description,
        //mois,
        //annee: parseInt(annee),
        id: true,
        fichier: true, 
        datePublication : true,
        createdBy: true,
      },
      orderBy: { datePublication: "desc" },
    });

    res.status(200).json(revues);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des revues.", error: error.message });
  }
};

export  {getRevues};
