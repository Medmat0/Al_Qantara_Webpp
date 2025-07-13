import pointsInteretService from '../../services/guides/pointsInteretService.js';
import guidesService from '../../services/guides/guidesService.js';
import { uploadPointInteretImages } from '../../utils/uploadUtils.js';

// Créer un nouveau point d'intérêt
const createPointInteret = async (req, res) => {
  try {
    const { guideId } = req.params;
    const {
      nom,
      description,
      adresse,
      latitude,
      longitude,
      horairesOuverture,
      tarifs,
      telephone,
      siteWeb,
      email,
      typePoint = 'AUTRE',
      ordre
    } = req.body;

    // Vérifier que le guide existe
    const guideExists = await guidesService.guideExists(guideId);

    if (!guideExists) {
      return res.status(404).json({
        success: false,
        message: 'Guide non trouvé'
      });
    }

    // Upload des images si présentes
    const images = req.files ? await uploadPointInteretImages(req.files) : [];

    const pointInteret = await pointsInteretService.createPointInteret(guideId, {
      nom,
      description,
      adresse,
      latitude,
      longitude,
      images,
      horairesOuverture,
      tarifs,
      telephone,
      siteWeb,
      email,
      typePoint,
      ordre
    });

    res.status(201).json({
      success: true,
      message: 'Point d\'intérêt créé avec succès',
      data: pointInteret
    });

  } catch (error) {
    console.error('Erreur lors de la création du point d\'intérêt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du point d\'intérêt',
      error: error.message
    });
  }
};

// Obtenir tous les points d'intérêt d'un guide
const getPointsInteretByGuide = async (req, res) => {
  try {
    const { guideId } = req.params;

    const pointsInteret = await pointsInteretService.getPointsInteretByGuide(guideId, req.query);

    res.json({
      success: true,
      data: pointsInteret
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des points d\'intérêt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des points d\'intérêt',
      error: error.message
    });
  }
};

// Obtenir un point d'intérêt par ID
const getPointInteretById = async (req, res) => {
  try {
    const { id } = req.params;

    const pointInteret = await pointsInteretService.getPointInteretById(id);

    if (!pointInteret) {
      return res.status(404).json({
        success: false,
        message: 'Point d\'intérêt non trouvé'
      });
    }

    res.json({
      success: true,
      data: pointInteret
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du point d\'intérêt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du point d\'intérêt',
      error: error.message
    });
  }
};

// Mettre à jour un point d'intérêt
const updatePointInteret = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      description,
      adresse,
      latitude,
      longitude,
      horairesOuverture,
      tarifs,
      telephone,
      siteWeb,
      email,
      typePoint,
      ordre,
      actif
    } = req.body;

    const existingPoint = await pointsInteretService.getPointInteretById(id);

    if (!existingPoint) {
      return res.status(404).json({
        success: false,
        message: 'Point d\'intérêt non trouvé'
      });
    }

    const updateData = {};
    if (nom) updateData.nom = nom;
    if (description !== undefined) updateData.description = description;
    if (adresse) updateData.adresse = adresse;
    if (latitude) updateData.latitude = parseFloat(latitude);
    if (longitude) updateData.longitude = parseFloat(longitude);
    if (horairesOuverture !== undefined) updateData.horairesOuverture = horairesOuverture;
    if (tarifs !== undefined) updateData.tarifs = tarifs;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (siteWeb !== undefined) updateData.siteWeb = siteWeb;
    if (email !== undefined) updateData.email = email;
    if (typePoint) updateData.typePoint = typePoint;
    if (ordre) updateData.ordre = parseInt(ordre);
    if (actif !== undefined) updateData.actif = actif === 'true' || actif === true;

    // Upload nouvelles images si présentes
    if (req.files && req.files.length > 0) {
      const newImages = await uploadPointInteretImages(req.files);
      updateData.images = [...existingPoint.images, ...newImages];
    }

    const pointInteret = await pointsInteretService.updatePointInteret(id, updateData);

    res.json({
      success: true,
      message: 'Point d\'intérêt mis à jour avec succès',
      data: pointInteret
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du point d\'intérêt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du point d\'intérêt',
      error: error.message
    });
  }
};

// Supprimer un point d'intérêt
const deletePointInteret = async (req, res) => {
  try {
    const { id } = req.params;

    const pointExists = await pointsInteretService.pointInteretExists(id);

    if (!pointExists) {
      return res.status(404).json({
        success: false,
        message: 'Point d\'intérêt non trouvé'
      });
    }

    await pointsInteretService.deletePointInteret(id);

    res.json({
      success: true,
      message: 'Point d\'intérêt supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du point d\'intérêt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du point d\'intérêt',
      error: error.message
    });
  }
};

// Réorganiser l'ordre des points d'intérêt
const reorderPointsInteret = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { pointsOrder } = req.body; // Array of { id, ordre }

    if (!Array.isArray(pointsOrder)) {
      return res.status(400).json({
        success: false,
        message: 'pointsOrder doit être un tableau'
      });
    }

    const pointsInteret = await pointsInteretService.reorderPointsInteret(guideId, pointsOrder);

    res.json({
      success: true,
      message: 'Ordre des points d\'intérêt mis à jour avec succès',
      data: pointsInteret
    });

  } catch (error) {
    console.error('Erreur lors de la réorganisation des points d\'intérêt:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réorganisation des points d\'intérêt',
      error: error.message
    });
  }
};

export {
  createPointInteret,
  getPointsInteretByGuide,
  getPointInteretById,
  updatePointInteret,
  deletePointInteret,
  reorderPointsInteret
};
