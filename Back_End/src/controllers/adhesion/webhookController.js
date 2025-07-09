import { processAdhesionPayment, processDonationPayment } from '../../services/adhesion/adhesion.service.js';

/**
 * @desc    Traite les webhooks HelloAsso pour les paiements
 * @method  POST
 * @route   /adhesion/webhook
 */
const handlePaymentWebhook = async (req, res) => {
  try {
    const { eventType, data } = req.body;
    
    console.log('Webhook reçu:', { eventType, data });

    // Vérifier le type d'événement
    if (eventType === 'Payment') {
      const paymentData = data;
      const { metadata } = paymentData;

      if (!metadata || !metadata.type) {
        console.log('Métadonnées manquantes dans le webhook');
        return res.status(200).json({ message: 'Webhook traité (métadonnées manquantes)' });
      }

      // Traiter selon le type de paiement
      if (metadata.type === 'adhesion') {
        await processAdhesionPayment(paymentData);
        console.log('Paiement d\'adhésion traité avec succès');
      } else if (metadata.type === 'donation') {
        await processDonationPayment(paymentData);
        console.log('Paiement de don traité avec succès');
      }

      res.status(200).json({ message: 'Webhook traité avec succès' });
    } else {
      console.log('Type d\'événement non géré:', eventType);
      res.status(200).json({ message: 'Type d\'événement non géré' });
    }
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({
      message: 'Erreur lors du traitement du webhook',
      error: error.message
    });
  }
};

/**
 * @desc    Traite manuellement un paiement d'adhésion (pour les tests)
 * @method  POST
 * @route   /adhesion/process-payment
 */
const processManualPayment = async (req, res) => {
  try {
    const { utilisateurId, type } = req.body;

    if (!utilisateurId || !type) {
      return res.status(400).json({
        message: 'ID utilisateur et type de paiement requis'
      });
    }

    const paymentData = {
      metadata: {
        utilisateurId: utilisateurId,
        type: type,
        montant: type === 'donation' ? req.body.montant : undefined
      },
      paymentId: `manual_${Date.now()}`
    };

    let result;
    if (type === 'adhesion') {
      result = await processAdhesionPayment(paymentData);
    } else if (type === 'donation') {
      result = await processDonationPayment(paymentData);
    } else {
      return res.status(400).json({ message: 'Type de paiement non valide' });
    }

    res.status(200).json({
      message: `Paiement ${type} traité manuellement avec succès`,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors du traitement manuel du paiement:', error);
    res.status(500).json({
      message: 'Erreur lors du traitement manuel du paiement',
      error: error.message
    });
  }
};

export { 
  handlePaymentWebhook,
  processManualPayment
};
