import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import querystring from 'querystring';

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
 * Crée un événement payant sur HelloAsso
 */
const createHelloAssoEvent = async (evenement) => {
  try {
    const token = await getAccessToken();
    
    const eventData = {
      title: evenement.titre,
      description: evenement.description,
      startDate: evenement.dateDebut,
      endDate: evenement.dateFin,
      price: Math.round(evenement.prix * 100), // Convertir en centimes
      maxParticipants: evenement.placesTotal,
      type: 'EVENT',
      place: {
        name: evenement.lieu || "Lieu à définir"
      }
    };

    console.log('Données envoyées à HelloAsso:', eventData);
    console.log('URL de la requête:', `${HELLOASSO_API_URL}/v3/organizations/${HELLOASSO_ORGANIZATION_SLUG}/forms`);

    const response = await axios.post(
      `${HELLOASSO_API_URL}/v5/organizations/${HELLOASSO_ORGANIZATION_SLUG}/forms`,
      eventData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Réponse HelloAsso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur détaillée HelloAsso:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
    });
    throw new Error('Impossible de créer l\'événement sur HelloAsso');
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
    const { paymentId, status, amount, metadata } = paymentData;
    const { evenementId, utilisateurId } = metadata;

    // Mettre à jour le statut du paiement dans notre base de données
    await prisma.paiementEvenement.update({
      where: {
        reference: paymentId
      },
      data: {
        statut: status === 'COMPLETED' ? 'VALIDE' : 'ANNULE'
      }
    });

    // Si le paiement est validé, mettre à jour la participation
    if (status === 'COMPLETED') {
      await prisma.participationEvenement.update({
        where: {
          evenementId_utilisateurId: {
            evenementId: parseInt(evenementId),
            utilisateurId: parseInt(utilisateurId)
          }
        },
        data: {
          statut: 'CONFIRME'
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Erreur lors du traitement du webhook de paiement:', error);
    throw new Error('Erreur lors du traitement du paiement');
  }
};

export {
  createHelloAssoEvent,
  checkPaymentStatus,
  handlePaymentWebhook
}; 