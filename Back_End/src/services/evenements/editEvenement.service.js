import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "./geocodeAddress.service.js";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Modifier un événement (Service Logic)
 * @param {number} evenementId - ID of the event to edit.
 * @param {object} eventData - Data to update.
 * @param {number} userId - ID of the user editing the event.
 * @returns {Promise<object>} The updated event.
 */

const editEvenementService = async (evenementId, eventData, userId) => {
  try {
    const existing = await prisma.evenement.findUnique({ where: { id: Number(evenementId) } });
    if (!existing) throw new Error("Événement non trouvé.");

    let coordinates = { latitude: existing.latitude, longitude: existing.longitude };
    if (eventData.adresse && eventData.adresse !== existing.lieu) {
      try {
        coordinates = await geocodeAddress(eventData.adresse);
      } catch (error) {
        throw new Error(`Impossible de convertir l'adresse en coordonnées géographiques: ${error.message}`);
      }
    }

    const updated = await prisma.evenement.update({
      where: { id: Number(evenementId) },
      data: {
        titre: eventData.titre ?? existing.titre,
        description: eventData.description ?? existing.description,
        dateDebut: eventData.dateDebut ? new Date(eventData.dateDebut) : existing.dateDebut,
        dateFin: eventData.dateFin ? new Date(eventData.dateFin) : existing.dateFin,
        lieu: eventData.adresse ?? existing.lieu,
        type: eventData.type ?? existing.type,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        placesTotal: eventData.placesTotal ? parseInt(eventData.placesTotal) : existing.placesTotal,
        placesRestantes: eventData.placesTotal ? parseInt(eventData.placesTotal) : existing.placesRestantes,
        images: eventData.images ?? existing.images,
        video: eventData.video ?? existing.video,
        isPayant: eventData.estPayant ?? existing.isPayant,
        prix: eventData.price !== undefined ? parseFloat(eventData.price) : existing.prix
      }
    });

    // Récupérer tous les participants
    const participations = await prisma.participationEvenement.findMany({
      where: { evenementId: Number(evenementId) },
      include: { utilisateur: true }
    });

    // Envoyer un email à chaque participant
    for (const participation of participations) {
      const utilisateur = participation.utilisateur;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style=\"color: #2c3e50; text-align: center;\">Mise à jour de l'événement</h2>
          <p>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</p>
          <p>L'événement \"${updated.titre}\" auquel vous êtes inscrit a été modifié. Voici les nouvelles informations :</p>
          <div style=\"background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;\">
            <h3 style=\"color: #2c3e50;\">Détails de l'événement :</h3>
            <p><strong>Date :</strong> ${new Date(updated.dateDebut).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure :</strong> ${new Date(updated.dateDebut).toLocaleTimeString('fr-FR')}</p>
            <p><strong>Lieu :</strong> ${updated.lieu}</p>
            <p><strong>Description :</strong> ${updated.description}</p>
          </div>
          <p style=\"color: #666; font-size: 14px;\">Merci de prendre en compte ces changements. Pour toute question, contactez l'équipe Al Qantara.</p>
          <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;\">
            <p style=\"color: #666; font-size: 12px;\">© 2024 Al Qantara. Tous droits réservés.</p>
          </div>
        </div>
      `;
      await sendEmailToUser({
        from: process.env.MAILER_APP_EMAIL,
        to: utilisateur.email,
        subject: `Mise à jour de l'événement - ${updated.titre}`,
        text: `L'événement \"${updated.titre}\" auquel vous êtes inscrit a été modifié. Merci de vérifier les nouvelles informations.`,
        html: emailHtml
      });
    }

    return updated;
  } catch (error) {
    throw error;
  }
};

export { editEvenementService };
