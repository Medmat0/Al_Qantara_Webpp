import { createCheckoutIntent, getCheckoutIntentDetails } from '../../services/evenements/helloAssoCheckout.service.js';

/**
 * @desc    Crée une intention de paiement HelloAsso
 * @method  POST
 * @route   /evenements/checkout
 */
const createCheckout = async (req, res) => {
  try {
    const { totalAmount, initialAmount, itemName, payer, metadata } = req.body;

    // Validation des données requises
    if (!totalAmount || !initialAmount || !itemName) {
      return res.status(400).json({
        message: 'Données de paiement incomplètes',
        required: ['totalAmount', 'initialAmount', 'itemName']
      });
    }

    const checkoutData = {
      totalAmount,
      initialAmount,
      itemName,
      payer,
      metadata
    };

    const checkoutResponse = await createCheckoutIntent(checkoutData);
    res.json(checkoutResponse);
  } catch (error) {
    console.error('Erreur lors de la création du checkout:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du checkout',
      error: error.message
    });
  }
};

/**
 * @desc    Récupère les détails d'une intention de paiement
 * @method  GET
 * @route   /evenements/checkout/:checkoutIntentId
 */
const getCheckoutDetails = async (req, res) => {
  try {
    const { checkoutIntentId } = req.params;
    const checkoutDetails = await getCheckoutIntentDetails(checkoutIntentId);
    res.json(checkoutDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du checkout:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des détails du checkout',
      error: error.message
    });
  }
};

export { createCheckout, getCheckoutDetails }; 