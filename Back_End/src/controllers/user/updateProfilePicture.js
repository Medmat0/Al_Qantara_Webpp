import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

/**
 * @desc    Mettre à jour la photo de profil
 * @method  PUT
 * @route   /user/profile/picture
 * @access  Private
 */
const updateProfilePicture = asyncHandler(async (req, res) => {
  console.log('Received request body:', req.body);
  const userId = req.user.id;
  const { photoUrl } = req.body;

  if (!photoUrl) {
    console.log('No photoUrl in request body');
    return res.status(400).json({ message: "URL de la photo manquante" });
  }

  // Vérifier si l'utilisateur existe
  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  console.log('Updating user profile with photoUrl:', photoUrl);

  // Mettre à jour l'URL de la photo dans la base de données
  const updatedUser = await prisma.utilisateur.update({
    where: { id: userId },
    data: {
      photoProfil: photoUrl,
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      photoProfil: true,
      role: true,
      dateInscription: true,
      statut: true,
    },
  });

  console.log('User updated successfully:', updatedUser);

  res.status(200).json({
    message: "Photo de profil mise à jour avec succès",
    user: updatedUser,
  });
});

export { updateProfilePicture }; 