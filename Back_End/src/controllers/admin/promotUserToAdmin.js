import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Promouvoir un utilisateur en admin (Admin uniquement)
 * @method  PATCH
 * @route   /admin/users/:id/promote
 */
const promoteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        message: "Utilisateur non trouvé." 
      });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({ 
        message: "Cet utilisateur est déjà administrateur." 
      });
    }

    const promotedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    res.status(200).json({ 
      message: "Utilisateur promu administrateur avec succès.",
      user: promotedUser 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la promotion de l'utilisateur.",
      error: error.message 
    });
  }
};

export { promoteUser };