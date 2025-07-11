import axios from 'axios';
import { getAccessToken } from './helloAsso.service.js';

const HELLOASSO_API_URL = process.env.HELLOASSO_API_URL;
const HELLOASSO_ORGANIZATION_SLUG = process.env.HELLOASSO_ORGANIZATION_SLUG;
const FRONTEND_URL = process.env.FRONT_URL || 'https://23a8-2a02-8428-8533-ea01-b80f-a38f-e50b-d6af.ngrok-free.app';

/**
 * Crée une intention de paiement HelloAsso
 * @param {Object} paymentData - Données du paiement
 * @param {number} paymentData.totalAmount - Montant total en centimes
 * @param {number} paymentData.initialAmount - Montant initial en centimes
 * @param {string} paymentData.itemName - Description de l'achat
 * @param {Object} paymentData.payer - Informations du payeur
 * @param {Object} paymentData.metadata - Métadonnées personnalisées
 * @returns {Promise<Object>} Réponse de l'API HelloAsso
 */
const createCheckoutIntent = async (paymentData) => {
  try {
    const token = await getAccessToken();
    
    // Construction des URLs avec les paramètres
    const baseUrl = FRONTEND_URL;
    const evenementId = paymentData.metadata.evenementId // l'id de l'événement (ex: 7)
    const utilisateurId = paymentData.metadata.utilisateurId
    const sessionToken = paymentData.metadata.sessionToken // Token de sécurité
    
    const backUrl = `${baseUrl}/events/payment/cancel?evenementId=${evenementId}&utilisateurId=${utilisateurId}`;
    const errorUrl = `${baseUrl}/events/payment/error?evenementId=${evenementId}&utilisateurId=${utilisateurId}`;
    const returnUrl = `${baseUrl}/events/payment/success?evenementId=${evenementId}&utilisateurId=${utilisateurId}&token=${sessionToken}`;
/*    const backUrl = `https://www.youtube.com/`;
    const errorUrl = `https://angularscript.com/`;
    const returnUrl = `https://www.dreamjob.ma/guides/calendrier-jours-feries-maroc/`;*/

    console.log('URLs de redirection:', { 
      returnUrl: returnUrl.toString(),
      backUrl: backUrl.toString(),
      errorUrl: errorUrl.toString()
    });

    const checkoutData = {
      totalAmount: Math.round(paymentData.totalAmount * 100),
      initialAmount: Math.round(paymentData.initialAmount * 100),
      itemName: paymentData.itemName,
      backUrl: backUrl.toString(),
      errorUrl: errorUrl.toString(),
      returnUrl: returnUrl.toString(),
      containsDonation: false,
      payer: paymentData.payer,
      metadata: paymentData.metadata,
      formSlug: "paiement-evenement",
      formType: "Event",
      formVersion: "V5",
      formAction: "Payment",
      formActionVersion: "V5"
    };


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
    console.log("response", response.data)
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'intention de paiement:', error);
    if (error.response?.data?.errors) {
      console.error('Détails des erreurs:', error.response.data.errors);
    }
    throw new Error('Impossible de créer l\'intention de paiement');
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

export {
  createCheckoutIntent,
  getCheckoutIntentDetails
}; 