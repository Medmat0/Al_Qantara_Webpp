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
import { PrismaClient } from "@prisma/client";
import { sendEmailToUser } from "../../utils/email.config.js";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Ajouter un abonnement à la newsletter
 */
export const ajouterAbonnementNewsletter = async (email) => {
  try {
    // Vérifier si l'email existe déjà
    const abonnementExistant = await prisma.newsletter.findUnique({
      where: { email: email }
    });

    if (abonnementExistant) {
      if (abonnementExistant.statut === 'DESINSCRIT') {
        // Réactiver l'abonnement existant
        const abonnement = await prisma.newsletter.update({
          where: { email: email },
          data: { 
            statut: 'ACTIF',
            dateInscription: new Date() // Mettre à jour la date d'inscription
          }
        });
        return abonnement;
      } else {
        throw new Error('Cet email est déjà inscrit à la newsletter');
      }
    }

    // Créer un nouvel abonnement
    const tokenDesinscription = crypto.randomBytes(32).toString('hex');
    
    const abonnement = await prisma.newsletter.create({
      data: {
        email,
        statut: 'ACTIF',
        tokenDesinscription
      }
    });

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