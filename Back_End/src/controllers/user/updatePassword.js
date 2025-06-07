import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { hashPassword } from "../../utils/hashPassword.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * @desc    Mettre à jour le mot de passe de l'utilisateur
 * @method  PUT
 * @route   /user/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Vérifier si l'utilisateur existe
  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    select: {
      id: true,
      motDePasse: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  // Vérifier si l'ancien mot de passe est correct
  const isPasswordValid = await bcrypt.compare(currentPassword, user.motDePasse);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Mot de passe actuel incorrect" });
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await hashPassword(newPassword);

  // Mettre à jour le mot de passe
  await prisma.utilisateur.update({
    where: { id: userId },
    data: {
      motDePasse: hashedPassword
    }
  });

  res.status(200).json({
    message: "Mot de passe mis à jour avec succès"
  });
});

export { updatePassword }; 