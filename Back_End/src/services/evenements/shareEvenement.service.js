import { PrismaClient } from "@prisma/client";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Partager un événement avec un contact (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {string} emailDestinataire - Email of the recipient.
 * @param {string} message - Optional message from the user.
 * @param {number} utilisateurId - ID of the user sharing the event.
 * @returns {Promise<object>} Newly created share record.
 */
const shareEvenementService = async (evenementId, emailDestinataire, message, utilisateurId) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) }
    });

    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    const partage = await prisma.partageEvenement.create({
      data: {
        evenementId: parseInt(evenementId),
        utilisateurId: utilisateurId,
        emailDestinataire,
        message
      }
    });

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId }
    });

    const emailContent = `
      Bonjour,

      ${utilisateur.nom} ${utilisateur.prenom} souhaite vous inviter à l'événement "${evenement.titre}".

      ${message ? `Message de ${utilisateur.nom}: ${message}` : ''}

      Date de début: ${new Date(evenement.dateDebut).toLocaleDateString()}
      Date de fin: ${new Date(evenement.dateFin).toLocaleDateString()}
      Lieu: ${evenement.lieu}

      Pour plus d'informations, veuillez visiter notre site web.

      Cordialement,
      L'équipe Al Qantara
    `;

    await sendEmailToUser({
      to: emailDestinataire,
      subject: `Invitation à l'événement: ${evenement.titre}`,
      text: emailContent
    });
    return partage;
  } catch (error) {
    throw error;
  }
};

export { shareEvenementService }; 