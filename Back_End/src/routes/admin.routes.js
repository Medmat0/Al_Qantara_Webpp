import express from 'express';
import {authMiddleware, isAdmin} from '../middleware/auth.middleware.js';
import { getAllUsers , deleteUser , updateUserStatus ,promoteUser , demoteUser} from '../controllers/admin/admin.index.js';


const router = express.Router();


router.get('/users', authMiddleware, isAdmin , getAllUsers);
router.delete('/users/:id',authMiddleware,  isAdmin,deleteUser);
router.patch('/users/:id/status',authMiddleware,  isAdmin,updateUserStatus);
router.patch('/users/:id/promote',authMiddleware, isAdmin  , promoteUser);
router.patch('/users/:id/demote',authMiddleware,  isAdmin,  demoteUser);

export default router;