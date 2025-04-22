import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Récupérer tous les utilisateurs (Admin uniquement)
 * @method  GET
 * @route   /admin/users
 * @returns {Object} - Liste des utilisateurs ou message approprié si vide
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statut: true,
        dateInscription: true,
        emailVerified: true,
        adhesion: {
          select: {
            statut: true,
            dateDemande: true
          }
        }
      },
      orderBy: {
        dateInscription: 'desc'
      }
    });

     if (users.length === 0) {
      return res.status(200).json({
        message: "Aucun utilisateur trouvé dans la base de données.",
        users: [],
        count: 0
      });
    }

    const formattedUsers = users.map(user => ({
      ...user,
      statutAdhesion: user.adhesion?.statut || 'NON_DEMANDE'
    }));

    res.status(200).json({
      message: `${formattedUsers.length} utilisateurs récupérés avec succès.`,
      users: formattedUsers,
      count: formattedUsers.length
    });

  } catch (error) {
    console.error("Erreur dans getAllUsers:", error);
    res.status(500).json({ 
      message: "Erreur serveur lors de la récupération des utilisateurs.",
      error: error.message 
    });
  }
};

export { getAllUsers };