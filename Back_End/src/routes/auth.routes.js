import express from "express";
const router = express.Router();


import {login, registerAdmin ,registerUser, verifyEmail , forgotPassword , changePassword} from "../controllers/authentification/Auth.index.js";

  
  
router.post("/register-alqantara-Admin", registerAdmin);
router.post("/register",registerUser)
router.post("/login",  login);
router.get("/verfiy/:token", verifyEmail)
router.post("/forgotpassword", forgotPassword);
router.patch("/changepassword", changePassword);



export default router;