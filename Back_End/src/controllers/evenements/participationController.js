import { createParticipation, confirmParticipation } from '../../services/evenements/participation.service.js';
import { createCheckoutIntent } from '../../services/evenements/helloAssoCheckout.service.js';

/**
 * @desc    Crée une participation et initialise le paiement
 * @method  POST
 * @route   /evenements/:eventId/participer
 */
const participerEvenement = async (req, res) => {
  try {
    const { eventId } = req.params;
   // const { userId } = req.user; // Supposant que l'authentification est en place
   const userId =  4; 
   const { montant } = req.body;

    // Créer la participation
    const participation = await createParticipation({
      evenementId: parseInt(eventId),
      utilisateurId: userId,
      montant
    });

    // Initialiser le paiement HelloAsso
    const paymentData = {
      totalAmount: montant * 100, // Convertir en centimes
      initialAmount: montant * 100,
      itemName: `Participation à l'événement ${participation.evenement.titre}`,
      payer: {
        firstName: participation.utilisateur.prenom,
        lastName: participation.utilisateur.nom,
        email: participation.utilisateur.email
      },
      metadata: {
        participationId: participation.id,
        eventId: eventId,
        userId: userId
      }
    };

    const checkoutResponse = await createCheckoutIntent(paymentData);
    res.json({
      participation,
      checkoutUrl: checkoutResponse.redirectUrl
    });
  } catch (error) {
    console.error('Erreur lors de la création de la participation:', error);
    res.status(500).json({
      message: 'Erreur lors de la création de la participation',
      error: error.message
    });
  }
};

/**
 * @desc    Confirme une participation après paiement
 * @method  POST
 * @route   /evenements/participation/confirmer
 */
const confirmerParticipation = async (req, res) => {
  try {
    const { participationId, paymentId } = req.body;

    const participation = await confirmParticipation({
      participationId,
      paymentId
    });

    res.json({
      message: 'Participation confirmée avec succès',
      participation
    });
  } catch (error) {
    console.error('Erreur lors de la confirmation de la participation:', error);
    res.status(500).json({
      message: 'Erreur lors de la confirmation de la participation',
      error: error.message
    });
  }
};

export {
  participerEvenement,
  confirmerParticipation
}; 