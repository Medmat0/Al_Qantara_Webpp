import { PrismaClient } from "@prisma/client";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Partager un événement avec un contact
 * @method  POST
 * @route   /evenements/:id/share
 */
const shareEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const { emailDestinataire, message } = req.body;
    const utilisateurId = req.user.id;

    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evenement) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Créer l'enregistrement de partage
    const partage = await prisma.partageEvenement.create({
      data: {
        evenementId: parseInt(id),
        utilisateurId: utilisateurId,
        emailDestinataire,
        message
      }
    });

    // Envoyer l'email au destinataire
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

    res.status(201).json({
      message: "Événement partagé avec succès.",
      partage
    });
  } catch (error) {
    console.error("Erreur lors du partage de l'événement:", error);
    res.status(500).json({
      message: "Erreur lors du partage de l'événement.",
      error: error.message
    });
  }
};

export { shareEvenement }; 