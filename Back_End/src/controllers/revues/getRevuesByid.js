import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


/**
 * @desc    Obtenir une revue par ID (accessible à tous authentifiés)
 * @method  GET
 * @route   /revues/:id
 */
const getRevueById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const revue = await prisma.revue.findUnique({
        where: { id: parseInt(id) },
        select: {
          titre: true,
          id: true,
          description,
          mois,
          annee: parseInt(annee),
          nombreVues : true,
          nombreTelechargements : true,
          fichier: true,
          datePublication: true,
          createdBy: true,
        },
      });
  
      if (!revue) {
        return res.status(404).json({ message: "Revue non trouvée." });
      }
  
      res.status(200).json(revue);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de la revue.", error: error.message });
    }
  };
  
  export { getRevueById };
  