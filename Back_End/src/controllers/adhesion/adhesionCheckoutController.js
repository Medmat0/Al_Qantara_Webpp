import { createAdhesionCheckoutIntent, createDonationCheckoutIntent, getCheckoutIntentDetails } from '../../services/adhesion/adhesionCheckout.service.js';
import { checkAdhesionStatus, processAdhesionPayment } from '../../services/adhesion/adhesion.service.js';

/**
 * @desc    Crée une intention de paiement HelloAsso pour l'adhésion
 * @method  POST
 * @route   /adhesion/checkout
 */
const createAdhesionCheckout = async (req, res) => {
  try {
    console.log('🎯 createAdhesionCheckout - Début');
    console.log('📋 Body de la requête:', req.body);
    console.log('👤 Utilisateur connecté:', req.user);
    
    const { utilisateurId } = req.body;
    const userId = req.user?.id || utilisateurId;

    if (!userId) {
      console.log('❌ Aucun ID utilisateur trouvé');
      return res.status(400).json({
        message: 'ID utilisateur requis'
      });
    }

    console.log('✅ ID utilisateur récupéré:', userId);

    // Validation des données du payer - Structure exacte HelloAsso
    let payerData;
    
    if (
      (req.user?.prenom && req.user.prenom.toLowerCase() === "admin") ||
      (req.user?.nom && req.user.nom.toLowerCase() === "admin")
    ) {
      payerData = {
        email: req.user?.email || 'yassineelmatroor@gmail.com',
        firstName: "Yassine",
        lastName: "Dupont"
      };
    } else {
      payerData = {
        email: req.user?.email || 'yassineelmatroor@gmail.com',
        firstName: req.user?.prenom || "Yassine",
        lastName: req.user?.nom || "El Matroor"
      };
    }

    // Vérification que tous les champs sont présents et valides
    if (!payerData.email || !payerData.firstName || !payerData.lastName) {
      return res.status(400).json({
        message: 'Données du payeur incomplètes',
        payer: payerData
      });
    }

    console.log('Structure payer avant envoi HelloAsso:', {
      email: payerData.email,
      firstName: payerData.firstName,
      lastName: payerData.lastName,
      hasEmail: !!payerData.email,
      hasFirstName: !!payerData.firstName,
      hasLastName: !!payerData.lastName
    });

    // Données fixes pour l'adhésion (structure identique aux événements)
    const adhesionData = {
      totalAmount: 20, // 20€ pour l'adhésion
      initialAmount: 20,
      itemName: 'Adhésion annuelle Al Qantara',
      payer: payerData,
      metadata: {
        type: 'adhesion',
        utilisateurId: userId
      }
    };

    console.log('Données payer pour adhésion:', adhesionData.payer);
    console.log('Utilisateur connecté:', req.user);
    console.log('Données complètes adhésion:', adhesionData);

    console.log('🚀 Appel à createAdhesionCheckoutIntent...');
    const checkoutResponse = await createAdhesionCheckoutIntent(adhesionData);
    console.log('✅ Réponse HelloAsso reçue:', checkoutResponse);
    
    res.json(checkoutResponse);
  } catch (error) {
    console.error('❌ Erreur dans createAdhesionCheckout:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      message: 'Erreur lors de la création du checkout adhésion',
      error: error.message
    });
  }
};

/**
 * @desc    Crée une intention de paiement HelloAsso pour un don
 * @method  POST
 * @route   /adhesion/donation/checkout
 */
const createDonationCheckout = async (req, res) => {
  try {
    const { montant, utilisateurId } = req.body;
    const userId = req.user?.id || utilisateurId;

    if (!montant || montant <= 0) {
      return res.status(400).json({
        message: 'Montant du don requis et doit être supérieur à 0'
      });
    }

    // Validation des données du payer pour le don - Structure exacte HelloAsso
    const payerData = {
      email: req.user?.email || 'yassineelmatroor@gmail.com',
      firstName: req.user?.prenom || "Yassine",
      lastName: req.user?.nom || "El Matroor"
    };

    // Vérification que tous les champs sont présents et valides
    if (!payerData.email || !payerData.firstName || !payerData.lastName) {
      return res.status(400).json({
        message: 'Données du payeur incomplètes pour le don',
        payer: payerData
      });
    }

    console.log('Structure payer don avant envoi HelloAsso:', {
      email: payerData.email,
      firstName: payerData.firstName,
      lastName: payerData.lastName,
      montant: parseFloat(montant)
    });

    const donationData = {
      totalAmount: parseFloat(montant),
      initialAmount: parseFloat(montant),
      itemName: `Don à Al Qantara - ${montant}€`,
      payer: payerData,
      metadata: {
        type: 'donation',
        utilisateurId: userId,
        montant: parseFloat(montant)
      }
    };

    const checkoutResponse = await createDonationCheckoutIntent(donationData);
    res.json(checkoutResponse);
  } catch (error) {
    console.error('Erreur lors de la création du checkout don:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du checkout don',
      error: error.message
    });
  }
};

/**
 * @desc    Récupère les détails d'une intention de paiement
 * @method  GET
 * @route   /adhesion/checkout/:checkoutIntentId
 */
const getAdhesionCheckoutDetails = async (req, res) => {
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

/**
 * @desc    Vérifie le statut d'adhésion d'un utilisateur
 * @method  GET
 * @route   /adhesion/status/:utilisateurId
 */
const checkUserAdhesionStatus = async (req, res) => {
  try {
    const { utilisateurId } = req.params;
    const status = await checkAdhesionStatus(Number(utilisateurId));
    res.json(status);
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'adhésion:', error);
    res.status(500).json({
      message: 'Erreur lors de la vérification du statut d\'adhésion',
      error: error.message
    });
  }
};

/**
 * @desc    Crée une adhésion directement (après paiement confirmé)
 * @method  POST
 * @route   /adhesion/create
 */
const createAdhesion = async (req, res) => {
  try {
    const { utilisateurId } = req.body;
    const userId = req.user?.id || utilisateurId;

    if (!userId) {
      return res.status(400).json({
        message: 'ID utilisateur requis'
      });
    }

    console.log('Création d\'adhésion pour l\'utilisateur:', userId);

    // Vérifier d'abord si l'utilisateur n'est pas déjà adhérent
    const currentStatus = await checkAdhesionStatus(userId);
    if (currentStatus.isAdherent) {
      return res.status(400).json({
        message: 'Utilisateur déjà adhérent',
        statut: currentStatus
      });
    }

    // Créer les données de paiement simulées pour le processus
    const paymentData = {
      metadata: {
        utilisateurId: userId,
        type: 'adhesion'
      },
      paymentId: `manual_${Date.now()}`,
      amount: 20, // Montant de l'adhésion
      status: 'authorized'
    };

    // Traiter l'adhésion
    const result = await processAdhesionPayment(paymentData);

    console.log('Adhésion créée avec succès:', result);

    res.status(201).json({
      message: 'Adhésion créée avec succès',
      data: {
        adhesion: result.adhesion,
        utilisateur: {
          id: result.utilisateur.id,
          nom: result.utilisateur.nom,
          prenom: result.utilisateur.prenom,
          email: result.utilisateur.email,
          role: result.utilisateur.role,
          statut: result.utilisateur.statut
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'adhésion:', error);
    res.status(500).json({
      message: 'Erreur lors de la création de l\'adhésion',
      error: error.message
    });
  }
};

export { 
  createAdhesionCheckout, 
  createDonationCheckout, 
  getAdhesionCheckoutDetails,
  checkUserAdhesionStatus,
  createAdhesion
};
