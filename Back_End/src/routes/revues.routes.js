import express from "express";
import { addRevue, deleteRevue, getRevues, getRevueById , incrementTelechargement , incrementVue } from "../controllers/revues/Revues.index.js";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js"
import {uploadRevue} from "../middleware/storage.middleware.js";


const router = express.Router();

router.post("/add", authMiddleware, isAdmin, uploadRevue.single("document"), addRevue);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteRevue);
router.get("/",getRevues);
router.get("/:id", getRevueById);
router.post("/:id/download", incrementTelechargement);
router.post("/:id/view", incrementVue);


export default router;