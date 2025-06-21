import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Envoie un email de confirmation de paiement
 * @param {Object} data - Données du paiement
 * @param {string} data.email - Email du participant
 * @param {string} data.nom - Nom du participant
 * @param {string} data.eventName - Nom de l'événement
 * @param {number} data.montant - Montant payé
 */
const sendPaymentConfirmationEmail = async (data) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: 'Confirmation de paiement - ' + data.eventName,
    html: `
      <h1>Confirmation de paiement</h1>
      <p>Bonjour ${data.nom},</p>
      <p>Nous vous confirmons la réception de votre paiement pour l'événement "${data.eventName}".</p>
      <p>Montant payé : ${data.montant}€</p>
      <p>Merci de votre participation !</p>
      <p>Cordialement,<br>L'équipe Al Qantara</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Envoie un email de confirmation de participation
 * @param {Object} data - Données de la participation
 * @param {string} data.email - Email du participant
 * @param {string} data.nom - Nom du participant
 * @param {string} data.eventName - Nom de l'événement
 * @param {string} data.eventDate - Date de l'événement
 * @param {string} data.eventLocation - Lieu de l'événement
 */
const sendParticipationConfirmationEmail = async (data) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: 'Confirmation de participation - ' + data.eventName,
    html: `
      <h1>Confirmation de participation</h1>
      <p>Bonjour ${data.nom},</p>
      <p>Votre participation à l'événement "${data.eventName}" a été confirmée.</p>
      <p>Détails de l'événement :</p>
      <ul>
        <li>Date : ${data.eventDate}</li>
        <li>Lieu : ${data.eventLocation}</li>
      </ul>
      <p>Nous vous attendons avec impatience !</p>
      <p>Cordialement,<br>L'équipe Al Qantara</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export {
  sendPaymentConfirmationEmail,
  sendParticipationConfirmationEmail
}; 