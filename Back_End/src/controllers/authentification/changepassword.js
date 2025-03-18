import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { hashPassword } from "../../utils/hashPassword.js";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * @desc    Permet à l'utilisateur de changer son mot de passe
 * @method  PATCH
 * @route   /api/v1/user/change-password
 * @access  public
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { password, accessCode } = req.body;

  // Hashage du code d'accès
  const hashedAccessCode = crypto.createHash("sha256").update(accessCode).digest("hex");

  // Vérification du token de réinitialisation
  const user = await prisma.utilisateur.findFirst({
    where: {
      passwordResetToken: hashedAccessCode,
    },
  });

  if (!user) return res.status(400).json({ message: "Code d'accès invalide" });

  // Hachage du nouveau mot de passe
  const hashedPassword = await hashPassword(password);

  // Mise à jour du mot de passe
  await prisma.utilisateur.update({
    where: {
      id: user.id,
    },
    data: {
      motDePasse: hashedPassword,
      passwordResetToken: null, // Réinitialisation du token de réinitialisation
      passwordResetTokenExpire: null, // Expiration du token
    },
  });

  res.status(201).json({ status: "Success", message: "Mot de passe modifié avec succès" });
});
