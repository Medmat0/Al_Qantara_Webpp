import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Permet à l'utilisateur de réinitialiser son mot de passe
 * @method  POST
 * @route   /auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await prisma.utilisateur.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) return res.status(404).json({ message: "Cet email n'existe pas." });

  // Générer un token de réinitialisation
  const plainResetToken = crypto.randomBytes(4).toString("hex");
  const hashedResetToken = await crypto
    .createHash("sha256")
    .update(plainResetToken)
    .digest("hex");

  // Mise à jour du token de réinitialisation dans la base de données
  await prisma.utilisateur.update({
    where: {
      email: email,
    },
    data: {
      passwordResetToken: hashedResetToken,
      passwordResetTokenExpire: String(Date.now() + 15 * 60 * 1000), // Le token expire après 15 minutes
    },
  });

  // Envoi de l'email avec le code de réinitialisation
  const info = {
    to: email,
    subject: "Réinitialisation de mot de passe",
    text: "Vous pouvez maintenant changer votre mot de passe.",
    html: `<h1>Réinitialisation de mot de passe</h1>
           <p>Voici votre code d'accès pour changer votre mot de passe : ${plainResetToken}</p>
           <p>Si vous n'avez pas demandé de réinitialisation, veuillez ignorer cet email.</p>`,
  };
  await sendEmailToUser(info);

  res.status(200).json({ status: "Success", message: "Code de réinitialisation envoyé." });
});

export { forgotPassword };
