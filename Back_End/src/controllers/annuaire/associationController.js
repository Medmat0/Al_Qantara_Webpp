import associationService from '../../services/annuaire/associationService.js';

/**
 * @desc    Créer une nouvelle association (admin)
 * @method  POST
 * @route   /annuaire/admin/associations
 */
const creerAssociation = async (req, res) => {
  try {
    const association = await associationService.creerAssociation(req);
    res.status(201).json({
      message: 'Association créée avec succès',
      association
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Erreur lors de la création de l\'association'
    });
  }
};

/**
 * @desc    Récupérer toutes les associations publiques (annuaire)
 * @method  GET
 * @route   /annuaire/associations
 */
const getAssociationsPubliques = async (req, res) => {
  try {
    const { ville, region, secteurActivite, recherche, page, limite } = req.query;
    
    const resultats = await associationService.getAssociationsPubliques({
      ville,
      region,
      secteurActivite,
      recherche,
      page,
      limite
    });

    res.json(resultats);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Erreur lors de la récupération des associations'
    });
  }
};

/**
 * @desc    Récupérer une association publique par ID
 * @method  GET
 * @route   /annuaire/associations/:id
 */
const getAssociationPublique = async (req, res) => {
  try {
    const association = await associationService.getAssociationPublique(req.params.id);
    res.json(association);
  } catch (error) {
    res.status(404).json({
      message: error.message || 'Association non trouvée'
    });
  }
};

/**
 * @desc    Admin: Récupérer toutes les associations
 * @method  GET
 * @route   /annuaire/admin/associations
 */
const getAllAssociations = async (req, res) => {
  try {
    const { page, limite } = req.query;
    
    const resultats = await associationService.getAllAssociationsAdmin({
      page,
      limite
    });

    res.json(resultats);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Erreur lors de la récupération des associations'
    });
  }
};

/**
 * @desc    Admin: Modifier une association
 * @method  PUT
 * @route   /annuaire/admin/associations/:id
 */
const modifierAssociation = async (req, res) => {
  try {
    const association = await associationService.modifierAssociation(
      req.params.id,
      req.body
    );

    res.json({
      message: 'Association modifiée avec succès',
      association
    });
  } catch (error) {
    if (error.message === 'Association non trouvée') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({
      message: error.message || 'Erreur lors de la modification de l\'association'
    });
  }
};

/**
 * @desc    Admin: Supprimer une association
 * @method  DELETE
 * @route   /annuaire/admin/associations/:id
 */
const supprimerAssociation = async (req, res) => {
  try {
    const resultat = await associationService.supprimerAssociation(req.params.id);
    res.json(resultat);
  } catch (error) {
    if (error.message === 'Association non trouvée') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({
      message: error.message || 'Erreur lors de la suppression de l\'association'
    });
  }
};

/**
 * @desc    Récupérer les statistiques de l'annuaire
 * @method  GET
 * @route   /annuaire/statistiques
 */
const getStatistiques = async (req, res) => {
  try {
    const statistiques = await associationService.getStatistiques();
    res.json(statistiques);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * @desc    Récupérer les secteurs d'activité
 * @method  GET
 * @route   /annuaire/secteurs
 */
const getSecteursActivite = async (req, res) => {
  try {
    const secteurs = await associationService.getSecteursActivite();
    res.json(secteurs);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Erreur lors de la récupération des secteurs'
    });
  }
};

/**
 * @desc    Récupérer les régions
 * @method  GET
 * @route   /annuaire/regions
 */
const getRegions = async (req, res) => {
  try {
    const regions = await associationService.getRegions();
    res.json(regions);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Erreur lors de la récupération des régions'
    });
  }
};

export { 
  creerAssociation,
  getAssociationsPubliques,
  getAssociationPublique,
  getAllAssociations,
  modifierAssociation,
  supprimerAssociation,
  getStatistiques,
  getSecteursActivite,
  getRegions
};
