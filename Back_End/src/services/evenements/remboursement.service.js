
import { PrismaClient } from '@prisma/client';
import { sendEmailToUser } from '../../utils/email.config.js';
const prisma = new PrismaClient();

export const createRemboursementDemande = async (utilisateurId, evenementId, raison) => {
  // Création de la demande
  const demande = await prisma.remboursementDemande.create({
    data: {
      utilisateurId,
      evenementId,
      status: 'en_attente',
      raison
    },
    include: {
      utilisateur: true,
      evenement: true
    }
  });

  // Envoi email confirmation à l'utilisateur
  if (demande.utilisateur?.email) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Demande de remboursement envoyée</h2>
        <p>Bonjour ${demande.utilisateur.prenom} ${demande.utilisateur.nom},</p>
        <p>Votre demande de remboursement pour l'événement <b>"${demande.evenement?.titre || ''}"</b> a bien été envoyée et sera traitée par l'équipe Al Qantara.</p>
        <p>Statut actuel : <b>En attente</b></p>
        <p>Motif : ${demande.raison || 'Non précisé'}</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">© 2024 Al Qantara. Tous droits réservés.</p>
        </div>
      </div>
    `;
    await sendEmailToUser({
      from: process.env.MAILER_APP_EMAIL,
      to: demande.utilisateur.email,
      subject: `Demande de remboursement envoyée - Al Qantara`,
      text: `Votre demande de remboursement a bien été envoyée et sera traitée par l'équipe Al Qantara.`,
      html: emailHtml
    });
  }
  return demande;
};

export const listRemboursementDemandes = async () => {
  return prisma.remboursementDemande.findMany({
    include: {
      // Si tu veux les infos utilisateur et événement, adapte selon tes modèles
       utilisateur: true,
       evenement: true
    }
  });
};

export const updateRemboursementDemandeStatus = async (id, status) => {
  // Mise à jour du statut
  const demande = await prisma.remboursementDemande.update({
    where: { id },
    data: { status },
    include: {
      utilisateur: true,
      evenement: true
    }
  });

  // Si accepté, envoyer un email à l'utilisateur
  if (status === 'accepte' && demande.utilisateur?.email) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Remboursement accepté</h2>
        <p>Bonjour ${demande.utilisateur.prenom} ${demande.utilisateur.nom},</p>
        <p>Votre demande de remboursement pour l'événement <b>"${demande.evenement?.titre || ''}"</b> a été <b>acceptée</b> par l'équipe Al Qantara.</p>
        <p>Vous recevrez le remboursement dans les prochains jours.</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">© 2024 Al Qantara. Tous droits réservés.</p>
        </div>
      </div>
    `;
    await sendEmailToUser({
      from: process.env.MAILER_APP_EMAIL,
      to: demande.utilisateur.email,
      subject: `Remboursement accepté - Al Qantara`,
      text: `Votre demande de remboursement a été acceptée. Vous recevrez le remboursement dans les prochains jours.`,
      html: emailHtml
    });
  }
  return demande;
};