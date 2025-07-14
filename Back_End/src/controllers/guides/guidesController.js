import guidesService from '../../services/guides/guidesService.js';
import { uploadMainImage, uploadGalleryImages } from '../../utils/uploadUtils.js';

// Créer un nouveau guide
const createGuide = async (req, res) => {
  try {
    const {
      nom,
      region,
      description,
      latitude,
      longitude,
      pointsInteret = []
    } = req.body;
    
    const creePar = req.user.id;

    // Parse pointsInteret si c'est une string JSON
    let parsedPointsInteret = [];
    if (pointsInteret) {
      if (typeof pointsInteret === 'string') {
        try {
          parsedPointsInteret = JSON.parse(pointsInteret);
        } catch (e) {
          console.error('Erreur parsing pointsInteret:', e);
          parsedPointsInteret = [];
        }
      } else if (Array.isArray(pointsInteret)) {
        parsedPointsInteret = pointsInteret;
      }
    }

    // Upload des images si présentes
    let imageUrl = null;
    let imageUrls = [];

    if (req.files && req.files.image) {
      imageUrl = await uploadMainImage(req.files.image[0]);
    }

    if (req.files && req.files.images) {
      imageUrls = await uploadGalleryImages(req.files.images);
    }

    // Créer le guide avec les points d'intérêt
    const guide = await guidesService.createGuide({
      nom,
      region,
      description,
      latitude,
      longitude,
      imageUrl,
      imageUrls,
      pointsInteret: parsedPointsInteret,
      creePar
    });

    res.status(201).json({
      success: true,
      message: 'Guide créé avec succès',
      data: guide
    });

  } catch (error) {
    console.error('Erreur lors de la création du guide:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du guide',
      error: error.message
    });
  }
};

// Obtenir tous les guides
const getAllGuides = async (req, res) => {
  try {
    const result = await guidesService.getAllGuides(req.query);

    res.json({
      success: true,
      data: result.guides,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des guides:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des guides',
      error: error.message
    });
  }
};

// Obtenir un guide par ID
const getGuideById = async (req, res) => {
  try {
    const { id } = req.params;

    const guide = await guidesService.getGuideById(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide non trouvé'
      });
    }

    res.json({
      success: true,
      data: guide
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du guide:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du guide',
      error: error.message
    });
  }
};

// Mettre à jour un guide
const updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      region,
      description,
      latitude,
      longitude,
      actif,
      pointsInteret = []
    } = req.body;

    // Vérifier que le guide existe
    const existingGuide = await guidesService.getGuideById(id);

    if (!existingGuide) {
      return res.status(404).json({
        success: false,
        message: 'Guide non trouvé'
      });
    }

    // Parse pointsInteret si c'est une string JSON
    let parsedPointsInteret = [];
    if (pointsInteret) {
      if (typeof pointsInteret === 'string') {
        try {
          parsedPointsInteret = JSON.parse(pointsInteret);
        } catch (e) {
          console.error('Erreur parsing pointsInteret:', e);
          parsedPointsInteret = [];
        }
      } else if (Array.isArray(pointsInteret)) {
        parsedPointsInteret = pointsInteret;
      }
    }

    // Préparer les données de mise à jour
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (region) updateData.region = region;
    if (description) updateData.description = description;
    if (latitude) updateData.latitude = parseFloat(latitude);
    if (longitude) updateData.longitude = parseFloat(longitude);
    if (actif !== undefined) updateData.actif = actif === 'true' || actif === true;

    // Upload nouvelle image principale si présente
    if (req.files && req.files.image) {
      updateData.image = await uploadMainImage(req.files.image[0]);
    }

    // Upload nouvelles images de galerie si présentes
    if (req.files && req.files.images) {
      const newImageUrls = await uploadGalleryImages(req.files.images);
      updateData.images = [...existingGuide.images, ...newImageUrls];
    }

    // Ajouter les points d'intérêt à mettre à jour
    updateData.pointsInteret = parsedPointsInteret;

    const guide = await guidesService.updateGuide(id, updateData);

    res.json({
      success: true,
      message: 'Guide mis à jour avec succès',
      data: guide
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du guide:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du guide',
      error: error.message
    });
  }
};

// Supprimer un guide
const deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;

    const guideExists = await guidesService.guideExists(id);

    if (!guideExists) {
      return res.status(404).json({
        success: false,
        message: 'Guide non trouvé'
      });
    }

    await guidesService.deleteGuide(id);

    res.json({
      success: true,
      message: 'Guide supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du guide:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du guide',
      error: error.message
    });
  }
};

export {
  createGuide,
  getAllGuides,
  getGuideById,
  updateGuide,
  deleteGuide
};
