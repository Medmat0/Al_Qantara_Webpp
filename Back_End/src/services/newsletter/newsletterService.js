import { PrismaClient } from "@prisma/client";
import { sendEmailToUser } from "../../utils/email.config.js";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Supprimer une newsletter par son ID
 */
export const supprimerNewsletterService = async (newsletterId) => {
  try {
    await prisma.newsletter.delete({
      where: { id: parseInt(newsletterId) }
    });
    return true;
  } catch (error) {
    throw new Error("Erreur lors de la suppression de la newsletter");
  }
};

/**
 * Changer le statut d'une newsletter (ACTIF, INACTIF, DESINSCRIT)
 */
export const changerStatutNewsletterService = async (newsletterId, statut) => {
  try {
    const updated = await prisma.newsletter.update({
      where: { id: parseInt(newsletterId) },
      data: { statut }
    });
    return updated;
  } catch (error) {
    throw new Error("Erreur lors de la mise à jour du statut de la newsletter");
  }
};

/**
 * Ajouter un abonnement à la newsletter
 */
export const ajouterAbonnementNewsletter = async (email) => {
  try {
    // Vérifier si l'email existe déjà
    const abonnementExistant = await prisma.newsletter.findUnique({
      where: { email: email }
    });

    let abonnement;
    let isNewSubscription = false;

    if (abonnementExistant) {
      if (abonnementExistant.statut === 'DESINSCRIT') {
        // Réactiver l'abonnement existant
        abonnement = await prisma.newsletter.update({
          where: { email: email },
          data: { 
            statut: 'ACTIF',
            dateInscription: new Date() // Mettre à jour la date d'inscription
          }
        });
        isNewSubscription = true; // Considérer comme nouvelle inscription pour l'email
      } else {
        throw new Error('Cet email est déjà inscrit à la newsletter');
      }
    } else {
      // Créer un nouvel abonnement
      const tokenDesinscription = crypto.randomBytes(32).toString('hex');
      
      abonnement = await prisma.newsletter.create({
        data: {
          email,
          statut: 'ACTIF',
          tokenDesinscription
        }
      });
      isNewSubscription = true;
    }

    // Envoyer l'email de bienvenue si c'est une nouvelle inscription
    if (isNewSubscription) {
      const emailHtml = `
        <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #9e2e2c 0%, #b8363f 100%); border-radius: 15px;">
          <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #9e2e2c; font-size: 2.2rem; margin: 0; font-weight: 700;">Al Qantara</h1>
              <p style="color: #666; font-size: 1.1rem; margin: 10px 0 0 0;">Association Culturelle</p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2c3e50; font-size: 1.8rem; margin: 0;">Bienvenue dans notre newsletter !</h2>
              <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #9e2e2c, #b8363f); margin: 15px auto; border-radius: 2px;"></div>
            </div>

            <div style="margin: 30px 0;">
              <p style="color: #555; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
                Merci de vous être abonné(e) à la newsletter d'<strong>Al Qantara</strong> ! 🎉
              </p>
              
              <p style="color: #555; font-size: 1rem; line-height: 1.6; margin-bottom: 20px;">
                Vous recevrez désormais régulièrement :
              </p>

              <ul style="color: #555; font-size: 1rem; line-height: 1.8; padding-left: 20px;">
                <li>📅 Nos derniers événements culturels et éducatifs</li>
                <li>🎨 Les actualités de notre association</li>
                <li>🌟 Des contenus exclusifs et des invitations spéciales</li>
                <li>📚 Des ressources culturelles et pédagogiques</li>
              </ul>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #9e2e2c;">
              <p style="color: #555; font-size: 0.95rem; margin: 0; line-height: 1.5;">
                <strong>💡 Astuce :</strong> Ajoutez notre adresse email à vos contacts pour être sûr(e) de recevoir tous nos messages !
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #777; font-size: 0.9rem; margin-bottom: 20px;">
                Suivez-nous également sur nos réseaux sociaux pour ne rien manquer !
              </p>
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 0.85rem; margin: 0;">
                Vous recevez cet email car vous vous êtes abonné(e) à notre newsletter.
              </p>
              <p style="color: #999; font-size: 0.85rem; margin: 5px 0 0 0;">
                <a href="${process.env.FRONT_URL}/newsletter/desinscription/${abonnement.tokenDesinscription}" 
                   style="color: #9e2e2c; text-decoration: none;">Se désabonner</a>
              </p>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 0.8rem; margin: 0;">© 2024 Al Qantara. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      `;

      // Envoyer l'email de bienvenue
      try {
        await sendEmailToUser({
          from: process.env.MAILER_APP_EMAIL,
          to: email,
          subject: "🎉 Bienvenue dans la newsletter Al Qantara !",
          html: emailHtml,
          text: `
Bienvenue dans la newsletter Al Qantara !

Merci de vous être abonné(e) à notre newsletter ! Vous recevrez désormais régulièrement nos derniers événements, actualités, et contenus exclusifs.

Pour vous désabonner : ${process.env.FRONT_URL}/newsletter/desinscription/${abonnement.tokenDesinscription}

© 2024 Al Qantara. Tous droits réservés.
          `.trim()
        });
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
        // Ne pas faire échouer l'inscription même si l'email ne part pas
      }
    }

    return abonnement;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Cet email est déjà inscrit à la newsletter');
    }
    throw error;
  }
};
/**
 * Se désinscrire de la newsletter par ID utilisateur
 */
export const desinscrireNewsletter = async (utilisateurId) => {
  try {
    const abonnement = await prisma.newsletter.update({
      where: { id: parseInt(utilisateurId) },
      data: { statut: 'DESINSCRIT' }
    });

    return abonnement;
  } catch (error) {
    throw new Error('Utilisateur non trouvé ou déjà désinscrit');
  }
};

/**
 * Récupérer l'abonnement d'un utilisateur par son ID
 */
export const getAbonnementParUtilisateur = async (utilisateurId) => {
  try {
    const abonnement = await prisma.newsletter.findUnique({
      where: { id: parseInt(utilisateurId) }
    });

    return abonnement;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer l'abonnement d'un utilisateur par son email
 */
export const getAbonnementParEmail = async (email) => {
  try {
    const abonnement = await prisma.newsletter.findUnique({
      where: { email: email }
    });

    return abonnement;
  } catch (error) {
    throw error;
  }
};

/**
 * Se désinscrire de la newsletter par email
 */
export const desinscrireNewsletterParEmail = async (email) => {
  try {
    const abonnement = await prisma.newsletter.update({
      where: { email: email },
      data: { statut: 'DESINSCRIT' }
    });

    return abonnement;
  } catch (error) {
    throw new Error('Abonnement non trouvé ou déjà désinscrit');
  }
};

/**
 * Envoyer une newsletter à tous les abonnés actifs
 */
export const envoyerNewsletter = async (titre, contenu) => {
  try {
    // Créer l'enregistrement de la newsletter envoyée
    const newsletterEnvoyee = await prisma.newsletterEnvoyee.create({
      data: {
        titre,
        contenu,
        statut: 'EN_COURS'
      }
    });

    // Récupérer tous les abonnés actifs
    const abonnes = await prisma.newsletter.findMany({
      where: { statut: 'ACTIF' }
    });

    let succesEnvoi = 0;
    let erreursEnvoi = 0;

    // Envoyer l'email à chaque abonné
    for (const abonne of abonnes) {
      try {
        await sendEmailToUser({
          from: process.env.MAILER_APP_EMAIL,
          to: abonne.email,
          subject: titre,
          html: contenu,
          text: contenu.replace(/<[^>]*>/g, '') // Version texte sans HTML
        });
        succesEnvoi++;
      } catch (error) {
        console.error(`Erreur envoi newsletter à ${abonne.email}:`, error);
        erreursEnvoi++;
      }
    }

    // Mettre à jour le statut de l'envoi
    await prisma.newsletterEnvoyee.update({
      where: { id: newsletterEnvoyee.id },
      data: {
        destinataires: succesEnvoi,
        statut: erreursEnvoi === 0 ? 'TERMINE' : 'ERREUR'
      }
    });

    return {
      message: `Newsletter envoyée à ${succesEnvoi} destinataires`,
      succes: succesEnvoi,
      erreurs: erreursEnvoi
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer tous les abonnés
 */
export const getAbonnesNewsletter = async () => {
  try {
    const abonnes = await prisma.newsletter.findMany({
      orderBy: { dateInscription: 'desc' }
    });
    return abonnes;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer l'historique des newsletters envoyées
 */
export const getHistoriqueNewsletters = async () => {
  try {
    const newsletters = await prisma.newsletterEnvoyee.findMany({
      orderBy: { dateEnvoi: 'desc' }
    });
    return newsletters;
  } catch (error) {
    throw error;
  }
};

/**
 * Envoyer une newsletter automatique (pour les tâches cron)
 */
export const envoyerNewsletterAutomatique = async () => {
  try {
    const titre = "Newsletter hebdomadaire - Al Qantara";
    const contenu = `
      <h1>Bienvenue dans notre newsletter hebdomadaire !</h1>
      <p>Découvrez nos derniers événements et actualités.</p>
      <p>Pour vous désinscrire, cliquez <a href="${process.env.FRONT_URL}/newsletter/desinscription">ici</a></p>
    `;

    return await envoyerNewsletter(titre, contenu);
  } catch (error) {
    console.error('Erreur lors de l\'envoi automatique de la newsletter:', error);
    throw error;
  }
}; 