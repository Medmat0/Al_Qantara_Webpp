import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
    getUserProfile,
    updateProfile,
    updateProfilePicture,
    updatePassword
} from "../controllers/user/index.js";
import { getCloudinarySignature } from "../controllers/user/cloudinarySignature.js";

const router = express.Router();

// Routes protégées (nécessitent une authentification)
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/profile/picture", authMiddleware, updateProfilePicture);
router.put("/password", authMiddleware, updatePassword);
router.get("/cloudinary-signature", getCloudinarySignature);


export default router; 