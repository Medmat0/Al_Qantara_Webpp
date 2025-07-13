import express from 'express';
import { 
  createGuide, 
  getAllGuides, 
  getGuideById, 
  updateGuide, 
  deleteGuide 
} from '../controllers/guides/guidesController.js';
import { 
  createPointInteret, 
  getPointsInteretByGuide, 
  getPointInteretById, 
  updatePointInteret, 
  deletePointInteret, 
  reorderPointsInteret 
} from '../controllers/guides/pointsInteretController.js';
import { authMiddleware , isAdmin } from '../middleware/auth.middleware.js';
import { uploadFields, uploadImages, handleUploadErrors } from '../utils/uploadUtils.js';

const router = express.Router();

// Routes pour les guides
// GET /api/guides - Obtenir tous les guides
router.get('/', getAllGuides);

// GET /api/guides/:id - Obtenir un guide par ID
router.get('/:id', getGuideById);

// POST /api/guides - Créer un nouveau guide (nécessite authentification)
router.post('/', authMiddleware, isAdmin,uploadFields, createGuide);

// PUT /api/guides/:id - Mettre à jour un guide (nécessite authentification)
router.put('/:id', authMiddleware, isAdmin, uploadFields, updateGuide);

// DELETE /api/guides/:id - Supprimer un guide (nécessite authentification)
router.delete('/:id', authMiddleware, isAdmin, deleteGuide);

// Routes pour les points d'intérêt
// GET /api/guides/:guideId/points-interet - Obtenir tous les points d'intérêt d'un guide
router.get('/:guideId/points-interet', getPointsInteretByGuide);

// POST /api/guides/:guideId/points-interet - Créer un nouveau point d'intérêt (nécessite authentification)
router.post('/:guideId/points-interet', authMiddleware, isAdmin, uploadImages, createPointInteret);

// PUT /api/guides/:guideId/points-interet/reorder - Réorganiser l'ordre des points d'intérêt (nécessite authentification)
router.put('/:guideId/points-interet/reorder', authMiddleware, isAdmin, reorderPointsInteret);

// GET /api/guides/:guideId/points-interet/:id - Obtenir un point d'intérêt par ID
router.get('/:guideId/points-interet/:id', isAdmin, getPointInteretById);

// PUT /api/guides/:guideId/points-interet/:id - Mettre à jour un point d'intérêt (nécessite authentification)
router.put('/:guideId/points-interet/:id', authMiddleware, isAdmin, uploadImages, updatePointInteret);

// DELETE /api/guides/:guideId/points-interet/:id - Supprimer un point d'intérêt (nécessite authentification)
router.delete('/:guideId/points-interet/:id', authMiddleware, isAdmin, deletePointInteret);

// Middleware de gestion d'erreur pour multer
router.use(handleUploadErrors);

export default router;
