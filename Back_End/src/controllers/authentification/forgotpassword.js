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

  // Envoi de l'email avec le code de réinitialisation (template harmonisé)
  const info = {
    to: email,
    subject: "Réinitialisation de mot de passe",
    text: "Vous pouvez maintenant changer votre mot de passe.",
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; color: #222;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding: 24px 0;">
            <img src='https://al-qantara.com/assets/main-icon.jpg' alt='Al Qantara' style='width: 80px; margin-bottom: 16px;' />
            <h2 style="color: #990000ff; margin-bottom: 8px;">Réinitialisation de mot de passe</h2>
          </div>
          <div style="padding: 0 32px 24px 32px;">
            <h3 style="color: #990000ff;">Votre code de réinitialisation</h3>
            <p>Bonjour,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe sur Al Qantara.</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="background: #990000ff; color: #fff; padding: 12px 32px; border-radius: 4px; font-size: 1.3rem; font-weight: bold; letter-spacing: 2px;">${plainResetToken}</span>
            </div>
            <p style="font-size: 15px; color: #888;">Ce code est valable 15 minutes. Si vous n'avez pas demandé de réinitialisation, ignorez cet email.</p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 13px; color: #888; text-align: center;">L'équipe Al Qantara<br>contact@al-qantara.com</p>
          </div>
        </div>
      </div>
    `,
  };
  await sendEmailToUser(info);

  res.status(200).json({ status: "Success", message: "Code de réinitialisation envoyé." });
});

export { forgotPassword };
