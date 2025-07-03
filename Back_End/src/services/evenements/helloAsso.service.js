import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import querystring from 'querystring';
import { participerEvenementService } from './participationEvenement.service.js';
import { processAdhesionPayment, processDonationPayment } from '../adhesion/adhesion.service.js';

const prisma = new PrismaClient();

const HELLOASSO_API_URL = process.env.HELLOASSO_API_URL;
const HELLOASSO_CLIENT_ID = process.env.HELLOASSO_CLIENT_ID;
const HELLOASSO_CLIENT_SECRET = process.env.HELLOASSO_CLIENT_SECRET;
const HELLOASSO_ORGANIZATION_SLUG = process.env.HELLOASSO_ORGANIZATION_SLUG;

/**
 * Génère un token d'accès pour l'API HelloAsso
 */
const getAccessToken = async () => {
  try {
    const data = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: HELLOASSO_CLIENT_ID,
      client_secret: HELLOASSO_CLIENT_SECRET
    });

    console.log('Tentative de connexion à HelloAsso avec:', {
      url: `${HELLOASSO_API_URL}/oauth2/token`,
      client_id: HELLOASSO_CLIENT_ID,
    });

    const response = await axios.post(
      `${HELLOASSO_API_URL}/oauth2/token`,
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Token obtenu avec succès');
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur détaillée lors de la génération du token:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error('Impossible de se connecter à HelloAsso');
  }
};

/**
 * Vérifie le statut d'un paiement HelloAsso
 */
const checkPaymentStatus = async (paymentId) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `${HELLOASSO_API_URL}/v3/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    throw new Error('Impossible de vérifier le statut du paiement');
  }
};

/**
 * Gère le webhook de paiement HelloAsso
 */
const handlePaymentWebhook = async (paymentData) => {
  try {
    console.log('Webhook de paiement reçu:', paymentData);
    
    const { paymentId, status, amount, metadata } = paymentData;
    const { evenementId, utilisateurId, type } = metadata;

    if (!evenementId || !utilisateurId) {
      console.error('Métadonnées manquantes:', metadata);
      throw new Error('Métadonnées de paiement incomplètes');
    }

    if (status === 'COMPLETED') {
      console.log('Paiement validé, création de la participation...');
      
      try {
        // Utiliser le service de participation existant
        const participation = await participerEvenementService(evenementId, utilisateurId);
        console.log('Participation créée avec succès:', participation);
        return participation;
      } catch (error) {
        console.error('Erreur lors de la création de la participation:', error);
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('Erreur lors du traitement du webhook de paiement:', error);
    throw new Error('Erreur lors du traitement du paiement');
  }
};

/**
 * Récupère une intention de paiement HelloAsso
 * @param {string} checkoutIntentId - ID de l'intention de paiement
 * @returns {Promise<object>} Les détails de l'intention de paiement
 */
const getCheckoutIntent = async (checkoutIntentId) => {
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
    console.error('Erreur lors de la récupération de l\'intention de paiement:', error);
    throw new Error('Impossible de récupérer l\'intention de paiement');
  }
};



export {
  checkPaymentStatus,
  handlePaymentWebhook,
  getCheckoutIntent,
  getAccessToken
  
};