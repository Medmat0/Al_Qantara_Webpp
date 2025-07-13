import nodemailer from "nodemailer";
import asyncHandler from "express-async-handler";

const transporter = nodemailer.createTransport({
  host: "smtp.ionos.fr", // serveur SMTP d'IONOS
  port: 587,
  secure: false, // true pour port 465, false pour 587
  auth: {
    user: process.env.MAILER_APP_EMAIL,     // ex: contact@tondomaine.com
    pass: process.env.MAILER_APP_PASSWORD,  // le mot de passe de ta boîte mail IONOS
  },
});

const sendEmailToUser = asyncHandler(async (info) => {
  const send = await transporter.sendMail({
    from: info.from || `"Ton Site" <${process.env.MAILER_APP_EMAIL}>`,
    to: info.to,
    subject: info.subject,
    text: info.text,
    html: info.html,
  });
  console.log("Message envoyé ! ID : ", send.messageId);
});

export { sendEmailToUser };