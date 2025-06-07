import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


/**
 * @desc    Mettre à jour une offre de recrutement
 * @method  PUT
 * @route   /offres/:id
 */
const editOffre = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre,
      description,
      tags,
      lieuDeTravail,
      typeDeContrat,
      dateDebut,
    } = req.body;

    // Check if typeDeContrat is a valid enum value
    const ContractType = ["CDI", "CDD", "BENEVOLAT", "FREELANCE", "STAGE", "INTERIM", "APPRENTISSAGE"];
    if (typeDeContrat && !ContractType.includes(typeDeContrat)) {
      return res.status(400).json({ message: "Type de contrat invalide." });
    }

    const updatedOffre = await prisma.offre.update({
      where: { id: parseInt(id) },
      data: {
        titre: titre || undefined,
        description: description || undefined,
        tags: tags || undefined,
        lieuDeTravail: lieuDeTravail || undefined,
        typeDeContrat: typeDeContrat || undefined,
        dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      },
    });

    res.status(200).json({
      message: "Offre mise à jour avec succès.",
      offre: updatedOffre,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'offre:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'offre.",
      error: error.message,
    });
  }
};

export { editOffre };

