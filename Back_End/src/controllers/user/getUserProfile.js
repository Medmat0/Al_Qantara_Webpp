import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @method  GET
 * @route   /user/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      photoProfil: true,
      role: true,
      dateInscription: true,
      statut: true,
      adhesion: {
        select: {
          statut: true,
          dateDemande: true
        }
      },
      evenements: {
        select: {
          id: true,
          titre: true,
          dateDebut: true,
          dateFin: true
        }
      },
      participations: {
        select: {
          id: true,
          evenement: {
            select: {
              id: true,
              titre: true,
              dateDebut: true,
              dateFin: true
            }
          },
          statut: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  res.status(200).json({
    message: "Profil récupéré avec succès",
    user
  });
});

export { getUserProfile }; 