import { handlePaymentWebhook, checkPaymentStatus } from '../../services/evenements/helloAsso.service.js';

/**
 * @desc    Gère le webhook de paiement HelloAsso
 * @method  POST
 * @route   /evenements/webhook
 */
const handlePaymentWebhookController = async (req, res) => {
  try {
    console.log('Webhook reçu:', req.body);
    
    // Vérifier la signature du webhook si nécessaire
    // const signature = req.headers['x-helloasso-signature'];
    
    const result = await handlePaymentWebhook(req.body);
    
    res.status(200).json({
      success: true,
      message: 'Webhook traité avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook',
      error: error.message
    });
  }
};

/**
 * @desc    Vérifie le statut d'un paiement
 * @method  GET
 * @route   /evenements/payment/:paymentId/status
 */
const checkPaymentStatusController = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const status = await checkPaymentStatus(paymentId);
    res.json({ status });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut du paiement:', error);
    res.status(500).json({
      message: 'Erreur lors de la vérification du statut du paiement',
      error: error.message
    });
  }
};

export {
  handlePaymentWebhookController,
  checkPaymentStatusController
}; 