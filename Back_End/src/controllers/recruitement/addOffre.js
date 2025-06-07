import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter une offre de recrutement
 * @method  POST
 * @route   /offres
 */
const addOffre = async (req, res) => {
  try {
    const {
      titre,
      description,
      tags,
      lieuDeTravail,
      typeDeContrat,
      dateDebut,
    } = req.body;

  

    // Utiliser un utilisateur par défaut (ID 1) pour les tests
    const defaultUserId = 1;
    //const defaultUserId = req.user.id;

    const nouvelleOffre = await prisma.offre.create({
      data: {
        titre,
        description,
        tags: tags || [],
        lieuDeTravail,
        typeDeContrat,
        dateDebut: new Date(dateDebut),
        createdBy: defaultUserId,
      },
    });

    res.status(201).json({
      message: "Offre ajoutée avec succès.",
      offre: nouvelleOffre,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'offre:", error);
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'offre.",
      error: error.message,
    });
  }
};

export { addOffre };
