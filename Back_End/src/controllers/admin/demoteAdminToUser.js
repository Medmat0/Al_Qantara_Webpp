import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Rétrograder un admin en user (Admin uniquement)
 * @method  PATCH
 * @route   /admin/users/:id/demote
 * @protection Empêche la rétrogradation de soi-même
 */
const demoteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(403).json({ 
        message: "Action interdite: Vous ne pouvez pas modifier votre propre rôle." 
      });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        message: "Utilisateur non trouvé." 
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(400).json({ 
        message: "Cet utilisateur n'est pas administrateur." 
      });
    }

    const demotedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: { role: "USER" },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    res.status(200).json({ 
      message: "Administrateur rétrogradé avec succès.",
      user: demotedUser 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la rétrogradation.",
      error: error.message 
    });
  }
};

export { demoteUser };