import { PrismaClient } from '@prisma/client';
import { sendEmailToUser } from '../../utils/email.config.js';
const prisma = new PrismaClient();

export const createRemboursementDemande = async (utilisateurId, evenementId, raison, rib) => {
  // Validation du RIB (optionnel mais recommandé)
  if (!rib || rib.trim() === '') {
    throw new Error('Le RIB est requis pour effectuer une demande de remboursement');
  }


  // Création de la demande
  const demande = await prisma.remboursementDemande.create({
    data: {
      utilisateurId,
      evenementId,
      status: 'en_attente',
      raison,
      rib: rib.trim()
    }
  });


  // Récupérer les informations utilisateur et événement séparément
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId }
  });

  const evenement = await prisma.evenement.findUnique({
    where: { id: evenementId }
  });

  // Envoi email confirmation à l'utilisateur
  if (utilisateur?.email) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Demande de remboursement envoyée</h2>
        <p>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</p>
        <p>Votre demande de remboursement pour l'événement <b>"${evenement?.titre || 'Événement inconnu'}"</b> a bien été envoyée et sera traitée par l'équipe Al Qantara.</p>
        <p>Statut actuel : <b>En attente</b></p>
        <p>Motif : ${demande.raison || 'Non précisé'}</p>
        <p>RIB fourni : ${demande.rib ? 'Oui' : 'Non'}</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">© 2024 Al Qantara. Tous droits réservés.</p>
        </div>
      </div>
    `;
    
    try {
      await sendEmailToUser({
        from: process.env.MAILER_APP_EMAIL,
        to: utilisateur.email,
        subject: `Demande de remboursement envoyée - Al Qantara`,
        text: `Votre demande de remboursement a bien été envoyée et sera traitée par l'équipe Al Qantara.`,
        html: emailHtml
      });
    } catch (emailError) {
      // Ne pas faire échouer la création de la demande si l'email échoue
    }
  }

  // Retourner la demande avec les informations complètes
  return {
    ...demande,
    utilisateur,
    evenement
  };
};

export const listRemboursementDemandes = async () => {
  const demandes = await prisma.remboursementDemande.findMany();
  
  // Récupérer les infos utilisateur et événement pour chaque demande
  const demandesAvecInfos = await Promise.all(
    demandes.map(async (demande) => {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: demande.utilisateurId }
      });
      const evenement = await prisma.evenement.findUnique({
        where: { id: demande.evenementId }
      });
      return {
        ...demande,
        utilisateur,
        evenement
      };
    })
  );
  
  return demandesAvecInfos;
};

export const updateRemboursementDemandeStatus = async (id, status) => {
  // Mise à jour du statut
  const demande = await prisma.remboursementDemande.update({
    where: { id },
    data: { status }
  });

  // Récupérer les informations utilisateur et événement séparément
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: demande.utilisateurId }
  });

  const evenement = await prisma.evenement.findUnique({
    where: { id: demande.evenementId }
  });

  // Si accepté, envoyer un email à l'utilisateur
  if (status === 'accepte' && utilisateur?.email) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Remboursement accepté</h2>
        <p>Bonjour ${utilisateur.prenom} ${utilisateur.nom},</p>
        <p>Votre demande de remboursement pour l'événement <b>"${evenement?.titre || ''}"</b> a été <b>acceptée</b> par l'équipe Al Qantara.</p>
        <p>Vous recevrez le remboursement dans les prochains jours.</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">© 2024 Al Qantara. Tous droits réservés.</p>
        </div>
      </div>
    `;
    await sendEmailToUser({
      from: process.env.MAILER_APP_EMAIL,
      to: utilisateur.email,
      subject: `Remboursement accepté - Al Qantara`,
      text: `Votre demande de remboursement a été acceptée. Vous recevrez le remboursement dans les prochains jours.`,
      html: emailHtml
    });
  }
  
  return {
    ...demande,
    utilisateur,
    evenement
  };
};

export const getRemboursementDemandesByEvent = async (evenementId) => {
  const demandes = await prisma.remboursementDemande.findMany({
    where: { evenementId }
  });
  
  // Récupérer les infos utilisateur pour chaque demande
  const demandesAvecInfos = await Promise.all(
    demandes.map(async (demande) => {
      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: demande.utilisateurId },
        select: { id: true, nom: true, prenom: true, email: true }
      });
      return {
        ...demande,
        utilisateur
      };
    })
  );
  
  return demandesAvecInfos;
};