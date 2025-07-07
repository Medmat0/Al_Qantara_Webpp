import { PrismaClient } from "@prisma/client";
import QRCode from 'qrcode';
import { sendEmailToUser } from "../../utils/email.config.js";
import cloudinary from "../../config/cloudinary.js";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * @desc    Vérifier la participation d'un utilisateur à un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {number} utilisateurId - ID of the user.
 * @returns {Promise<object>} Participation object or null.
 */
const checkParticipationService = async (evenementId, utilisateurId) => {
  try {
    const participation = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(evenementId),
          utilisateurId: utilisateurId
        }
      }
    });
    return participation || null;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Participer à un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {number} utilisateurId - ID of the user participating.
 * @returns {Promise<object>} Newly created participation.
 */
const participerEvenementService = async (evenementId, utilisateurId) => {
  try {
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) },
      include: {
        createur: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    if (evenement.placesRestantes !== null && evenement.placesRestantes <= 0) {
      throw new Error("Désolé, il n'y a plus de places disponibles pour cet événement.");
    }

    const participationExistante = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(evenementId),
          utilisateurId: utilisateurId
        }
      }
    });

    if (participationExistante) {
      throw new Error("Vous participez déjà à cet événement.");
    }

    const qrCodeData = JSON.stringify({
      e: parseInt(evenementId),
      u: utilisateurId,
      t: new Date().getTime()
    });

    const qrCodeBase64 = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'L',
      margin: 1,
      width: 200
    });

    const qrCodeBuffer = Buffer.from(qrCodeBase64.split(',')[1], 'base64');

    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "qrcodes",
          public_id: `participation_${evenementId}_${utilisateurId}_${uuidv4()}`,
          resource_type: "image"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(qrCodeBuffer);
    });

    const participation = await prisma.participationEvenement.create({
      data: {
        evenementId: parseInt(evenementId),
        utilisateurId: utilisateurId,
        qrCode: uploadResponse.secure_url
      }
    });

    if (evenement.placesRestantes !== null) {
      await prisma.evenement.update({
        where: { id: parseInt(evenementId) },
        data: {
          placesRestantes: evenement.placesRestantes - 1
        }
      });
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId }
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Confirmation de participation</h2>
        <p>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</p>
        <p>Votre participation à l'événement "${evenement.titre}" a été confirmée.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50;">Détails de l'événement :</h3>
          <p><strong>Date :</strong> ${new Date(evenement.dateDebut).toLocaleDateString('fr-FR')}</p>
          <p><strong>Heure :</strong> ${new Date(evenement.dateDebut).toLocaleTimeString('fr-FR')}</p>
          <p><strong>Lieu :</strong> ${evenement.lieu}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p><strong>Votre QR Code de participation :</strong></p>
          <img src="${uploadResponse.secure_url}" alt="QR Code" style="max-width: 200px;"/>
        </div>

        <p style="color: #666; font-size: 14px;">Présentez ce QR code à l'entrée de l'événement.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">© 2024 Al Qantara. Tous droits réservés.</p>
        </div>
      </div>
    `;

    await sendEmailToUser({
      from: process.env.MAILER_APP_EMAIL,
      to: utilisateur.email,
      subject: `Confirmation de participation - ${evenement.titre}`,
      text: `Votre participation à l'événement "${evenement.titre}" a été confirmée.`,
      html: emailHtml
    });
    return participation;
  } catch (error) {
    throw error;
  }
};

export { checkParticipationService, participerEvenementService }; 