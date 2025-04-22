import express from 'express';
import { isAdmin } from '../middleware/auth.middleware.js';
import { getAllUsers , deleteUser , updateUserStatus ,promoteUser , demoteUser} from '../controllers/admin/admin.index.js';


const router = express.Router();


router.get('/users', isAdmin , getAllUsers);
router.delete('/users/:id', isAdmin,deleteUser);
router.patch('/users/:id/status', isAdmin,updateUserStatus);
router.patch('/users/:id/promote',isAdmin  , promoteUser);
router.patch('/users/:id/demote', isAdmin,  demoteUser);

export default router;