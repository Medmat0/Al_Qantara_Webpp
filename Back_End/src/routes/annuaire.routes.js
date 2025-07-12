import express from 'express';
const router = express.Router();
import { 
  creerAssociation,
  getAssociationsPubliques,
  getAssociationPublique,
  getAllAssociations,
  modifierAssociation,
  supprimerAssociation,
  getStatistiques,
  getSecteursActivite,
  getRegions
} from '../controllers/annuaire/associationController.js';
import { authMiddleware , isAdmin } from "../middleware/auth.middleware.js";
import { uploadlogoAssociations } from "../middleware/storage.middleware.js";

// Routes publiques (annuaire)
router.get('/associations', getAssociationsPubliques);
router.get('/associations/:id', getAssociationPublique);
router.get('/secteurs', getSecteursActivite);
router.get('/regions', getRegions);
router.get('/statistiques', getStatistiques);

// Routes admin pour gérer les associations
router.get('/admin/associations', 
  authMiddleware, 
  isAdmin, 
  getAllAssociations
);

router.post('/admin/associations', 
  authMiddleware,
  isAdmin,
  uploadlogoAssociations.single('logo'),
  creerAssociation
);

router.put('/admin/associations/:id', 
  authMiddleware, 
  isAdmin,
  modifierAssociation
);

router.delete('/admin/associations/:id', 
  authMiddleware, 
  isAdmin,
  supprimerAssociation
);

export default router;
