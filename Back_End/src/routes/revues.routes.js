import express from "express";
import { addRevue, deleteRevue, getRevues, getRevueById } from "../controllers/revues/Revues.index.js";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js"
import {upload} from "../middleware/storage.middleware.js";


const router = express.Router();

router.post("/add", isAdmin ,upload.single("document"), addRevue);
router.delete("/delete/:id", isAdmin ,deleteRevue);
router.get("/",getRevues);
router.get("/:id", getRevueById); 



export default router;