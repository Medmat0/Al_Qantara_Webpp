import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Supprimer un utilisateur (Admin uniquement)
 * @method  DELETE
 * @route   /admin/users/:id
 * @protection Admin, ne peut pas se supprimer soi-même
 */
const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = parseInt(req.params.id);
    const currentUserId = req.user.id;

    if (userIdToDelete === currentUserId) {
      return res.status(403).json({ 
        message: "Action interdite: Vous ne pouvez pas supprimer votre propre compte." 
      });
    }

    const userToDelete = await prisma.utilisateur.findUnique({
      where: { id: userIdToDelete }
    });

    if (!userToDelete) {
      return res.status(404).json({ 
        message: "Utilisateur non trouvé." 
      });
    }

    await prisma.utilisateur.delete({
      where: { id: userIdToDelete }
    });

    res.status(200).json({ 
      message: "Utilisateur supprimé avec succès.",
      deletedUserId: userIdToDelete 
    });

  } catch (error) {
    console.error("Erreur dans deleteUser:", error);
    res.status(500).json({ 
      message: "Erreur lors de la suppression de l'utilisateur.",
      error: error.message 
    });
  }
};

export { deleteUser };