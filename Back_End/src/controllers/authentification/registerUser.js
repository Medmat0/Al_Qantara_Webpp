import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { hashPassword } from "../../utils/hashPassword.js";
import crypto from "crypto";
import { sendEmailToUser } from "../../utils/email.config.js";
import { ROLES } from "../../utils/role.enum.js";
import {STATUS} from "../../utils/status.enum.js"
import {BASE_URL} from "../../utils/urls.js";


const prisma = new PrismaClient();

/**
 * @desc    Inscription des utilisateurs (USER / ADHERENT)
 * @method  POST
 * @route   /auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { nom, prenom, email, password, role, telephone } = req.body;

  const emailExist = await prisma.utilisateur.findUnique({ where: { email } });
  if (emailExist) return res.status(400).json({ message: "Email déjà utilisé" });

  const userRole =   ROLES.USER;

  const hashedPassword = await hashPassword(password);

  const user = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      telephone,
      role: userRole,
      dateInscription: new Date(), 
      statut: "ACTIF",

    },
  });

  const plainVerifyToken = crypto.randomBytes(64).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(plainVerifyToken).digest("hex");

  await prisma.utilisateur.update({
    where: { email: user.email },
    data: { emailVerificationToken: hashedToken },
  });

  const verifyLink = `${BASE_URL}/auth/verify-email/${plainVerifyToken}`;

  const emailInfo = {
    to: email,
    subject: "Vérification de votre email",
    text: "Veuillez vérifier votre email",
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px; color: #222;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding: 24px 0;">
            <img src='https://al-qantara.com/assets/main-icon.jpg' alt='Al Qantara' style='width: 80px; margin-bottom: 16px;' />
            <h2 style="color: #990000ff; margin-bottom: 8px;">Bienvenue sur Al Qantara</h2>
          </div>
          <div style="padding: 0 32px 24px 32px;">
            <h3 style="color: #990000ff;">Vérification de l'email</h3>
            <p>Bonjour <b>${nom}</b>,</p>
            <p>Merci de vous être inscrit sur Al Qantara ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
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
  const value = await sendEmailToUser(emailInfo);
  console.log(value);

  res.status(201).json({ message: "Inscription réussie", data: user });
})

export {registerUser}