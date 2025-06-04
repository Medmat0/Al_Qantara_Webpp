import { PrismaClient } from "@prisma/client";
import QRCode from 'qrcode';
import { sendEmailToUser } from "../../utils/email.config.js";
import cloudinary from "../../config/cloudinary.js";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * @desc    Vérifier la participation d'un utilisateur à un événement
 * @method  GET
 * @route   /evenements/:id/participation
 */
const checkParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id;

    const participation = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(id),
          utilisateurId: utilisateurId
        }
      }
    });

    res.status(200).json({
      participation: participation || null
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la participation:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification de la participation.",
      error: error.message
    });
  }
};

/**
 * @desc    Vérifier la participation d'un utilisateur à un événement via QR code
 * @method  GET
 * @route   /evenements/:id/participation/:id
 */

const checkQRCodeParticipation = async (req, res) => {
  try {
    const evenementId = parseInt(req.params.evenementId);
    const utilisateurId = parseInt(req.params.utilisateurId);

    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: evenementId }
    });
    if (!evenement) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Vérifier la participation de l'utilisateur
    const participation = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId,
          utilisateurId
        }
      },
      include: {
        evenement: {
          select: { titre: true, dateDebut: true, lieu: true }
        },
        utilisateur: {
          select: { nom: true, prenom: true, email: true }
        }
      }
    });

    if (!participation) {
      return res.status(404).json({ message: "Participation non trouvée pour cet utilisateur à cet événement." });
    }

    res.status(200).json({ participation });
  } catch (error) {
    console.error("Erreur lors de la vérification de la participation par QR code:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification de la participation par QR code.",
      error: error.message
    });
  }
};



/**
 * @desc    Participer à un événement
 * @method  POST
 * @route   /evenements/:id/participer
 */
const participerEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user.id;
    //const utilisateurId = 1; // Pour test

    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) },
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
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Vérifier s'il reste des places
    if (evenement.placesRestantes !== null && evenement.placesRestantes <= 0) {
      return res.status(400).json({ message: "Désolé, il n'y a plus de places disponibles pour cet événement." });
    }

    // Vérifier si l'utilisateur participe déjà
    const participationExistante = await prisma.participationEvenement.findUnique({
      where: {
        evenementId_utilisateurId: {
          evenementId: parseInt(id),
          utilisateurId: utilisateurId
        }
      }
    });

    if (participationExistante) {
      return res.status(400).json({ message: "Vous participez déjà à cet événement." });
    }

    // Générer l’URL à encoder dans le QR code
    const baseUrl = process.env.FRONTURL || "http://localhost:4200";
    const qrCodeUrl = `${baseUrl}/admin/events/${id}/qr-participation/${utilisateurId}?t=${Date.now()}`;

    // Générer le QR code à partir de l’URL
    const qrCodeBase64 = await QRCode.toDataURL(qrCodeUrl, {
      errorCorrectionLevel: 'L',
      margin: 1,
      width: 200
    });

    // Convertir le base64 en buffer
    const qrCodeBuffer = Buffer.from(qrCodeBase64.split(',')[1], 'base64');

    // Uploader le QR code sur Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
          {
            folder: "qrcodes",
            public_id: `participation_${id}_${utilisateurId}_${uuidv4()}`,
            resource_type: "image"
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
      ).end(qrCodeBuffer);
    });

    // Créer la participation avec l'URL Cloudinary
    const participation = await prisma.participationEvenement.create({
      data: {
        evenementId: parseInt(id),
        utilisateurId: utilisateurId,
        qrCode: uploadResponse.secure_url
      }
    });

    // Mettre à jour le nombre de places restantes
    if (evenement.placesRestantes !== null) {
      await prisma.evenement.update({
        where: { id: parseInt(id) },
        data: {
          placesRestantes: evenement.placesRestantes - 1
        }
      });
    }

    // Envoyer l'email de confirmation
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

    res.status(201).json({
      message: "Participation confirmée avec succès.",
      participation
    });
  } catch (error) {
    console.error("Erreur lors de la participation:", error);
    res.status(500).json({
      message: "Erreur lors de la participation à l'événement.",
      error: error.message
    });
  }
};

export { participerEvenement, checkParticipation, checkQRCodeParticipation };