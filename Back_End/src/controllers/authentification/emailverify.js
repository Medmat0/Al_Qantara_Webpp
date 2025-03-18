import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * @desc    Vérification de l'email de l'utilisateur
 * @method  PATCH
 * @route   /auth/verify/:token
 */
const verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params?.token;
  const hashToken = await crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.utilisateur.findFirst({
    where: {
      emailVerificationToken: hashToken,
    },
  });

  if (!user) return res.status(400).json({ message: "Token de vérification invalide" });

  // Mise à jour de l'utilisateur après vérification de l'email
  await prisma.utilisateur.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerificationToken: null, // Réinitialisation du token
      statut: "ACTIF", // L'utilisateur devient actif
    },
  });

  res.status(200).json({ status: "Success", message: "Email vérifié avec succès." });
});

export { verifyEmail };
