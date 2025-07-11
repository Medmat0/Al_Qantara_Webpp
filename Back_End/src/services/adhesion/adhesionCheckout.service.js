import axios from 'axios';
import { getAccessToken } from '../evenements/helloAsso.service.js';

const HELLOASSO_API_URL = process.env.HELLOASSO_API_URL;
const HELLOASSO_ORGANIZATION_SLUG = process.env.HELLOASSO_ORGANIZATION_SLUG;
const FRONTEND_URL = process.env.FRONT_URL || 'https://23a8-2a02-8428-8533-ea01-b80f-a38f-e50b-d6af.ngrok-free.app';

/**
 * Crée une intention de paiement HelloAsso pour l'adhésion
 * @param {Object} adhesionData - Données de l'adhésion
 * @returns {Promise<Object>} Réponse de l'API HelloAsso
 */
const createAdhesionCheckoutIntent = async (adhesionData) => {
  try {
    const token = await getAccessToken();
    
    // Construction des URLs avec les paramètres (exactement comme pour les événements)
    const baseUrl = FRONTEND_URL;
    const utilisateurId = adhesionData.metadata.utilisateurId;
    
    // Générer un token de session unique pour sécuriser la redirection
    const sessionToken = generateSecureToken(utilisateurId, 'adhesion');
    
    const backUrl = `${baseUrl}/adhesion/payment-cancel?userId=${utilisateurId}&type=adhesion`;
    const errorUrl = `${baseUrl}/adhesion/payment-error?userId=${utilisateurId}&type=adhesion`;
    const returnUrl = `${baseUrl}/adhesion/payment-success?userId=${utilisateurId}&type=adhesion&token=${sessionToken}`;

    console.log('URLs de redirection adhésion:', { 
      returnUrl: returnUrl.toString(),
      backUrl: backUrl.toString(),
      errorUrl: errorUrl.toString()
    });

    // Structure exactement identique au service événements
    const checkoutData = {
      totalAmount: Math.round(adhesionData.totalAmount * 100),
      initialAmount: Math.round(adhesionData.initialAmount * 100),
      itemName: adhesionData.itemName,
      backUrl: backUrl.toString(),
      errorUrl: errorUrl.toString(),
      returnUrl: returnUrl.toString(),
      containsDonation: false,
      payer: adhesionData.payer,
      metadata: adhesionData.metadata,
      formSlug: "adhesion-alqantara",
      formType: "Event",
      formVersion: "V5",
      formAction: "Payment",
      formActionVersion: "V5"
    };

    console.log('Données checkout adhésion:', JSON.stringify(checkoutData, null, 2));
    console.log('Payer structure:', JSON.stringify(checkoutData.payer, null, 2));
    console.log('Token HelloAsso:', token ? 'Token présent' : 'Token manquant');

    const response = await axios.post(
      `${HELLOASSO_API_URL}/v5/organizations/${HELLOASSO_ORGANIZATION_SLUG}/checkout-intents`,
      checkoutData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log("Réponse checkout adhésion:", response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'intention de paiement adhésion:', error);
    if (error.response?.data?.errors) {
      console.error('Détails des erreurs:', error.response.data.errors);
    }
    throw new Error('Impossible de créer l\'intention de paiement pour l\'adhésion');
  }
};

/**
 * Crée une intention de paiement HelloAsso pour un don
 * @param {Object} donationData - Données du don
 * @returns {Promise<Object>} Réponse de l'API HelloAsso
 */
const createDonationCheckoutIntent = async (donationData) => {
  try {
    const token = await getAccessToken();
    
    const baseUrl = FRONTEND_URL;
    const utilisateurId = donationData.metadata.utilisateurId;
    const montant = donationData.metadata.montant;
    
    // Générer un token de session unique pour sécuriser la redirection
    const sessionToken = generateSecureToken(utilisateurId, 'don');
    
    const backUrl = `${baseUrl}/adhesion/payment-cancel?userId=${utilisateurId}&type=don&amount=${montant}`;
    const errorUrl = `${baseUrl}/adhesion/payment-error?userId=${utilisateurId}&type=don&amount=${montant}`;
    const returnUrl = `${baseUrl}/adhesion/payment-success?userId=${utilisateurId}&type=don&amount=${montant}&token=${sessionToken}`;

    console.log('URLs de redirection don:', { 
      returnUrl: returnUrl.toString(),
      backUrl: backUrl.toString(),
      errorUrl: errorUrl.toString()
    });

    const checkoutData = {
      totalAmount: Math.round(donationData.totalAmount * 100), // Conversion en centimes
      initialAmount: Math.round(donationData.initialAmount * 100),
      itemName: donationData.itemName,
      backUrl: backUrl.toString(),
      errorUrl: errorUrl.toString(),
      returnUrl: returnUrl.toString(),
      containsDonation: true, // Important : c'est un don
      payer: donationData.payer,
      metadata: donationData.metadata,
      formSlug: "don-alqantara",
      formType: "Event",
      formVersion: "V5",
      formAction: "Payment",
      formActionVersion: "V5"
    };

    console.log('Données checkout don:', JSON.stringify(checkoutData, null, 2));

    const response = await axios.post(
      `${HELLOASSO_API_URL}/v5/organizations/${HELLOASSO_ORGANIZATION_SLUG}/checkout-intents`,
      checkoutData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log("Réponse checkout don:", response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'intention de paiement don:', error);
    if (error.response?.data?.errors) {
      console.error('Détails des erreurs:', error.response.data.errors);
    }
    throw new Error('Impossible de créer l\'intention de paiement pour le don');
  }
};

/**
 * Récupère les détails d'une intention de paiement
 * @param {string} checkoutIntentId - ID de l'intention de paiement
 * @returns {Promise<Object>} Détails de l'intention de paiement
 */
const getCheckoutIntentDetails = async (checkoutIntentId) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `${HELLOASSO_API_URL}/v5/organizations/${HELLOASSO_ORGANIZATION_SLUG}/checkout-intents/${checkoutIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du paiement:', error);
    throw new Error('Impossible de récupérer les détails du paiement');
  }
};

/**
 * Génère un token sécurisé pour la redirection
 * @param {string} userId ID de l'utilisateur
 * @param {string} type Type de paiement
 * @returns {string} Token sécurisé
 */
const generateSecureToken = (userId, type) => {
  const timestamp = Date.now();
  const randomBytes = Math.random().toString(36).substring(2, 15);
  const baseString = `${userId}-${type}-${timestamp}-${randomBytes}`;
  return Buffer.from(baseString).toString('base64');
};

export {
  createAdhesionCheckoutIntent,
  createDonationCheckoutIntent,
  getCheckoutIntentDetails,
  generateSecureToken
};
