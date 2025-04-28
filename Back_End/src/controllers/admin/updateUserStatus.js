import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Modifier le statut d'un utilisateur (Admin uniquement)
 * @method  PATCH
 * @route   /admin/users/:id/status
 * @body    { statut: "ACTIF"|"INACTIF" }
 */
const updateUserStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { statut } = req.body;

    if (!["ACTIF", "INACTIF"].includes(statut)) {
      return res.status(400).json({ 
        message: "Statut invalide. Doit être 'ACTIF' ou 'INACTIF'." 
      });
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: { statut },
      select: {
        id: true,
        email: true,
        statut: true
      }
    });

    res.status(200).json({ 
      message: `Statut utilisateur mis à jour avec succès: ${statut}`,
      user: updatedUser 
    });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ 
        message: "Utilisateur non trouvé." 
      });
    }
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour du statut.",
      error: error.message 
    });
  }
};

export { updateUserStatus };