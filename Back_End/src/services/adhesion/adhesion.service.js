import { PrismaClient } from '@prisma/client';

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
    await prisma.utilisateur.update({
      where: { id: parseInt(utilisateurId) },
      data: {
        statut: 'ACTIF',
        role: 'ADHERENT'
      }
    });

    console.log('Adhésion traitée avec succès:', adhesion);
    return adhesion;
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

export {
  processAdhesionPayment,
  processDonationPayment,
  checkAdhesionStatus
};
