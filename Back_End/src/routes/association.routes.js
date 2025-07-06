import express from 'express';
const router = express.Router();
import { getAllAssociations, createAssociation, deleteAssociation } from '../controllers/associationController.js';
import { authMiddleware , isAdmin } from "../middleware/auth.middleware.js";


// GET all associations
router.get('/', getAllAssociations);

// POST create association
router.post('/',authMiddleware,isAdmin, createAssociation);

// DELETE association
router.delete('/:id',authMiddleware,isAdmin, deleteAssociation);

export default router;
