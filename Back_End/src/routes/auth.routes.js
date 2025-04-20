import express from "express";
const router = express.Router();


import {
    login,
    registerAdmin,
    registerUser,
    verifyEmail,
    forgotPassword,
    changePassword,
    checkAuthStatus,
    logout,
    refreshAccessToken
} from "../controllers/authentification/Auth.index.js";

  
// URL SPECIFIQUE POUR ADMIN    
router.post("/register-alqantara-Admin", registerAdmin);

router.post("/register",registerUser)

router.post("/login",  login);
router.post("/logout",logout);
router.get("/auth-check", checkAuthStatus);
router.post("/refresh-accesstoken", refreshAccessToken);
router.get("/verify/:token", verifyEmail)
router.post("/forgotpassword", forgotPassword);
router.patch("/changepassword", changePassword);



export default router;