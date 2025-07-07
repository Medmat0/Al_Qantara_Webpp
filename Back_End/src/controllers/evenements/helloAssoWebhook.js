import { handlePaymentWebhook } from "../../services/evenements/helloAsso.service.js";

/**
 * @desc    Gère les webhooks de paiement HelloAsso
 * @method  POST
 * @route   /evenements/webhook/helloasso
 */
const handleHelloAssoWebhook = async (req, res) => {
  try {
    const { eventType, data } = req.body;

    // Vérifier que c'est bien un événement de paiement
    if (eventType !== 'Payment.Confirmed' && eventType !== 'Payment.Refused') {
      return res.status(200).json({ message: 'Événement ignoré' });
    }

    // Traiter le paiement
    await handlePaymentWebhook(data);

    res.status(200).json({ message: 'Webhook traité avec succès' });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({
      message: 'Erreur lors du traitement du webhook',
      error: error.message
    });
  }
};

export { handleHelloAssoWebhook }; 