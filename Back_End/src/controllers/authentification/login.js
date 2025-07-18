import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import { comparePassword } from "../../utils/hashPassword.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../../utils/token.js";
import { sendEmailToUser } from "../../utils/email.config.js";
import {BASE_URL} from "../../utils/urls.js"

const prisma = new PrismaClient();

/**
 * @desc    User type email and password to login
 * @method  post
 * @route   /auth/login
 * @access  public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Recherche l'utilisateur dans la base de données avec l'email
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email: email } });
  if (!utilisateur) return res.status(400).json({ message: "Wrong email or password." });

  // Comparaison du mot de passe
  const matchedPasswords = await comparePassword(password, utilisateur.motDePasse);
  if (!matchedPasswords) return res.status(400).json({ message: "Wrong email or password" });

  // Vérification du statut d'activité de l'utilisateur
  if (utilisateur.statut === "INACTIF") {
    return res.status(403).json({
      message: "Votre compte est inactif. Veuillez contacter l'administrateur pour réactiver votre compte."
    });
  }

  // Vérification de l'email
  if (!utilisateur.emailVerified) {
    const plainVerfiyToken = crypto.randomBytes(64).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainVerfiyToken)
      .digest("hex");

    await prisma.utilisateur.update({
      where: {
        email: utilisateur.email,
      },
      data: {
        emailVerificationToken: hashedToken,
      },
    });

    const verifyLink = `${BASE_URL}/auth/verify-email/${plainVerfiyToken}`;



    // Envoi du mail de vérification
    const info = {
      to: email,
      subject: "Vérification de votre email",
      text: "Veuillez vérifier votre email",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; color: #222;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <div style="text-align: center; padding: 24px 0;">
              <img src='https://al-qantara.com/assets/main-icon.jpg' alt='Al Qantara' style='width: 80px; margin-bottom: 16px;' />
              <h2 style="color: #990000ff; margin-bottom: 8px;">Vérification de votre email</h2>
            </div>
            <div style="padding: 0 32px 24px 32px;">
              <h3 style="color: #990000ff;">Lien de vérification</h3>
              <p>Bonjour <b>${utilisateur.nom}</b>,</p>
              <p>Merci de vous connecter sur Al Qantara ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${verifyLink}" style="background: #990000ff; color: #fff; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-weight: bold;">Vérifier mon email</a>
              </div>
              <p style="font-size: 14px; color: #888;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br><span style="word-break: break-all;">${verifyLink}</span></p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 13px; color: #888; text-align: center;">L'équipe Al Qantara<br>contact@al-qantara.com</p>
            </div>
          </div>
        </div>
      `,
    };
    const value = await sendEmailToUser(info);
    console.log(value)
    return res.status(401).json({ message: "Verify your account please!" });
  }

  // Création des tokens
  const accessToken = await createAccessToken(utilisateur.id);
  const refreshToken = await createRefreshToken(utilisateur.id);

  // Stockage du refresh token dans un cookie
  res.cookie("refreshToken", refreshToken, {
    maxAge: 90 * 24 * 60 * 60 * 1000,
     secure: true,
    sameSite: "None",
    httpOnly: true,

  });

  res.cookie("accessToken", accessToken, {
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: "None",
    httpOnly: true,
  });




  // Réponse avec le user et l'access token
  res.status(200).json({ utilisateur});
});

export { login };
