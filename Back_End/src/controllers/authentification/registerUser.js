import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { hashPassword } from "../../utils/hashPassword.js";
import crypto from "crypto";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Inscription des utilisateurs (USER / ADHERENT)
 * @method  POST
 * @route   /auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { nom, prenom, email, password, role } = req.body;

  const emailExist = await prisma.utilisateur.findUnique({ where: { email } });
  if (emailExist) return res.status(400).json({ message: "Email déjà utilisé" });

  const userRole =  "USER";

  const hashedPassword = await hashPassword(password);

  const user = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      role: userRole,
      dateInscription: new Date(),
      statut: "ACTIF",
    },
  });

  if (!user)
    return res.status(400).json({ message: "Erreur lors de l'inscription" });

  const plainVerifyToken = crypto.randomBytes(64).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(plainVerifyToken).digest("hex");

  await prisma.utilisateur.update({
    where: { email: user.email },
    data: { emailVerificationToken: hashedToken },
  });
  const verifyLink = `http://localhost:3000/auth/verify/${plainVerifyToken}`; 


  const emailInfo = {
    from: "Mailer Company",
    to: email,
    subject: "Vérification de votre email",
    text: "Veuillez vérifier votre email",
    html: `<h1>Vérification de l'email</h1>
           <p>Bonjour ${nom}, cliquez sur le lien ci-dessous pour vérifier votre compte :</p>
           <a href="${verifyLink}">Vérifier mon email</a>`,
  };
  const value = await sendEmailToUser(emailInfo);
  console.log(value)

  res.status(201).json({ message: "Inscription réussie", data: user });
})

export {registerUser}