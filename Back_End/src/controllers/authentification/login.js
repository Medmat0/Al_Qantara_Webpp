import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import { comparePassword } from "../../utils/hashPassword.js";
import {
  createAccessToken,
  createRefreshToken,
} from "../../utils/token.js";
import { sendEmailToUser } from "../../utils/email.config.js";
const prisma = new PrismaClient();

/**
 * @desc    User type email and password to login
 * @method  post
 * @route   /login
 * @access  public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Recherche l'utilisateur dans la base de données avec l'email
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email: email } });
  if (!utilisateur) return res.status(400).json({ message: "Wrong email or password." });

  // Comparaison du mot de passe
  console.log(password, "hash $",utilisateur.motDePasse)
  const matchedPasswords = await comparePassword(password, utilisateur.motDePasse);
  if (!matchedPasswords) return res.status(400).json({ message: "Wrong email or password" });

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

    const verifyLink = `http://localhost:3000/auth/verfiy/${plainVerfiyToken}`; // ou remplacer par ton URL en production


    // Envoi du mail de vérification
    const info = {
      from: `Mailer Company`,
      to: email,
      subject: "Email verification",
      text: "Verify your email",
      html: `<h1>Email verification </h1>
          <p>Hello ${utilisateur.nom}, Please follow this link to verify your account. </p><a href= "${verifyLink}"> Click link </a>
          <p>If you did not verify your account, you won't be able to use many website features.</p>`,
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
    httpOnly: true,
  });

  // Réponse avec le user et l'access token
  res.status(200).json({ utilisateur, token: accessToken });
});

export { login };
