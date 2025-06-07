import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

/**
 * @desc    Mettre à jour le profil utilisateur
 * @method  PUT
 * @route   /user/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { nom, prenom } = req.body;
  const userId = req.user.id; // L'ID de l'utilisateur connecté

  // Vérifier si l'utilisateur existe
  const user = await prisma.utilisateur.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  // Mettre à jour le profil
  const updatedUser = await prisma.utilisateur.update({
    where: { id: userId },
    data: {
      nom: nom || user.nom,
      prenom: prenom || user.prenom
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      dateInscription: true,
      statut: true
    }
  });

  res.status(200).json({
    message: "Profil mis à jour avec succès",
    user: updatedUser
  });
});

export { updateProfile }; 