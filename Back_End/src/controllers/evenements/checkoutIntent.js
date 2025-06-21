import { getCheckoutIntent } from "../../services/evenements/helloAsso.service.js";

/**
 * @desc    Récupère une intention de paiement HelloAsso
 * @method  GET
 * @route   /evenements/checkout-intent/:checkoutIntentId
 */
const getCheckoutIntentController = async (req, res) => {
  try {
    const { checkoutIntentId } = req.params;
    const checkoutIntent = await getCheckoutIntent(checkoutIntentId);
    res.json(checkoutIntent);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'intention de paiement:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'intention de paiement',
      error: error.message
    });
  }
};

export { getCheckoutIntentController }; 