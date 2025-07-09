import { PrismaClient } from '@prisma/client';
import { sendEmailToUser } from '../../utils/email.config.js';

const prisma = new PrismaClient();

/**
 * Traite le paiement d'adhésion validé
 * @param {Object} paymentData - Données du paiement
 * @returns {Promise<Object>} Adhésion créée ou mise à jour
 */
const processAdhesionPayment = async (paymentData) => {
  try {
    const { utilisateurId } = paymentData.metadata;

    if (!utilisateurId) {
      throw new Error('ID utilisateur manquant dans les métadonnées');
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(utilisateurId) },
      include: { adhesion: true }
    });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    // Créer ou mettre à jour l'adhésion
    let adhesion;
    if (utilisateur.adhesion) {
      // Mettre à jour l'adhésion existante
      adhesion = await prisma.adhesion.update({
        where: { utilisateurId: parseInt(utilisateurId) },
        data: {
          statut: 'ACCEPTE',
          dateDemande: new Date()
        }
      });
    } else {
      // Créer une nouvelle adhésion
      adhesion = await prisma.adhesion.create({
        data: {
          utilisateurId: parseInt(utilisateurId),
          dateDemande: new Date(),
          statut: 'ACCEPTE'
        }
      });
    }

    // Mettre à jour le statut de l'utilisateur
    const utilisateurMisAJour = await prisma.utilisateur.update({
      where: { id: parseInt(utilisateurId) },
      data: {
        statut: 'ACTIF',
        role: 'ADHERENT'
      }
    });

    // Envoyer l'email de bienvenue
    await envoyerEmailBienvenue(utilisateur.email, utilisateur.prenom, utilisateur.nom);

    console.log('Adhésion traitée avec succès:', adhesion);
    return { adhesion, utilisateur: utilisateurMisAJour };
  } catch (error) {
    console.error('Erreur lors du traitement de l\'adhésion:', error);
    throw error;
  }
};

/**
 * Traite le paiement de don validé
 * @param {Object} paymentData - Données du paiement
 * @returns {Promise<Object>} Enregistrement du don
 */
const processDonationPayment = async (paymentData) => {
  try {
    const { utilisateurId, montant } = paymentData.metadata;
    const { paymentId } = paymentData;

    if (!utilisateurId || !montant) {
      throw new Error('Données manquantes dans les métadonnées du don');
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(utilisateurId) }
    });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    // Enregistrer le don dans la base de données
    const don = await prisma.don.create({
      data: {
        utilisateurId: parseInt(utilisateurId),
        montant: parseFloat(montant),
        dateDon: new Date(),
        statut: 'VALIDE',
        reference: paymentId,
        helloAssoId: paymentId
      }
    });

    console.log('Don enregistré avec succès:', don);
    return don;
  } catch (error) {
    console.error('Erreur lors du traitement du don:', error);
    throw error;
  }
};

/**
 * Vérifie le statut d'adhésion d'un utilisateur
 * @param {number} utilisateurId - ID de l'utilisateur
 * @returns {Promise<Object>} Statut d'adhésion
 */
const checkAdhesionStatus = async (utilisateurId) => {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: parseInt(utilisateurId) },
      include: { adhesion: true }
    });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      isAdherent: utilisateur.adhesion?.statut === 'ACCEPTE',
      statut: utilisateur.statut,
      role: utilisateur.role,
      adhesion: utilisateur.adhesion
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'adhésion:', error);
    throw error;
  }
};

/**
 * Envoie un email de bienvenue à un nouvel adhérent
 * @param {string} email - Email de l'adhérent
 * @param {string} prenom - Prénom de l'adhérent
 * @param {string} nom - Nom de l'adhérent
 */
const envoyerEmailBienvenue = async (email, prenom, nom) => {
  try {
    const subject = 'Bienvenue dans l\'association Al Qantara !';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5a2320, #a67c52); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f3f0; padding: 30px; border-radius: 0 0 10px 10px; }
          .badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .benefits { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .benefit-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
          .cta-button { background: #5a2320; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue chez Al Qantara !</h1>
            <p>Votre adhésion a été confirmée</p>
          </div>
          
          <div class="content">
            <h2>Félicitations ${prenom} ${nom} !</h2>
            
            <div class="badge">✅ Statut : ADHÉRENT ACTIF</div>
            
            <p>Nous sommes ravis de vous accueillir dans notre association Al Qantara ! Votre adhésion a été confirmée et vous faites désormais partie de notre communauté de plus de 500 membres.</p>
            
            <div class="benefits">
              <h3>🎯 Vos avantages adhérent :</h3>
              <div class="benefit-item">📅 <strong>Accès prioritaire</strong> à tous nos événements culturels</div>
              <div class="benefit-item">🤝 <strong>Réseau professionnel</strong> et opportunités de networking</div>
              <div class="benefit-item">💰 <strong>Réductions exclusives</strong> chez nos partenaires</div>
              <div class="benefit-item">📧 <strong>Newsletter mensuelle</strong> avec toutes nos actualités</div>
              <div class="benefit-item">🎪 <strong>Invitations VIP</strong> aux événements spéciaux</div>
            </div>
            
            <p>Votre profil a été automatiquement mis à jour avec votre nouveau statut d'adhérent. Vous pouvez dès maintenant :</p>
            
            <ul>
              <li>Consulter votre profil mis à jour</li>
              <li>Découvrir nos prochains événements</li>
              <li>Rejoindre notre communauté en ligne</li>
              <li>Contacter notre équipe pour toute question</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/profile" class="cta-button">
                Voir mon profil adhérent
              </a>
            </div>
            
            <p><strong>Prochaines étapes :</strong></p>
            <ol>
              <li>Consultez notre agenda d'événements</li>
              <li>Mettez à jour vos préférences de notification</li>
              <li>Rejoignez nos groupes thématiques</li>
            </ol>
            
            <div class="footer">
              <p>Merci de faire partie de l'aventure Al Qantara !</p>
              <p><strong>L'équipe Al Qantara</strong><br>
              Association Culturelle Marocaine</p>
              <p>
                <a href="${process.env.FRONTEND_URL}">Site web</a> | 
                <a href="mailto:contact@alqantara.org">Contact</a> | 
                <a href="${process.env.FRONTEND_URL}/events">Événements</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Bienvenue dans l'association Al Qantara !

Félicitations ${prenom} ${nom} !

Votre adhésion a été confirmée et vous faites désormais partie de notre communauté de plus de 500 membres.

Statut : ADHÉRENT ACTIF

Vos avantages adhérent :
- Accès prioritaire à tous nos événements culturels
- Réseau professionnel et opportunités de networking  
- Réductions exclusives chez nos partenaires
- Newsletter mensuelle avec toutes nos actualités
- Invitations VIP aux événements spéciaux

Consultez votre profil : ${process.env.FRONTEND_URL}/profile

Merci de faire partie de l'aventure Al Qantara !

L'équipe Al Qantara
Association Culturelle Marocaine
`;

    await sendEmailToUser({
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent
    });

    console.log(`Email de bienvenue envoyé à ${email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    // Ne pas faire échouer le processus d'adhésion si l'email ne peut pas être envoyé
  }
};

export {
  processAdhesionPayment,
  processDonationPayment,
  checkAdhesionStatus
};
