import express from "express";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";
import {createCommunity} from "../controllers/community/createCommunity.js";
import {uploadlogoCommunities} from "../middleware/storage.middleware.js";
import {getCommunities, getCommunityById, getCommunityByName} from "../controllers/community/getCommunity.js";
import {deleteCommunity} from "../controllers/community/deleteCommunity.js";
import {modifyCommunity} from "../controllers/community/modifyCommunity.js";

const router = express.Router();
// png file for logo of community---------------
router.post("/create", authMiddleware, uploadlogoCommunities.single('logo'), createCommunity)
router.get("/name", getCommunityByName);
router.get("/:communityId", getCommunityById);
router.get("/", getCommunities);
router.patch("/:communityId", authMiddleware, uploadlogoCommunities.single('logo'), modifyCommunity);
router.delete("/:communityId", authMiddleware, deleteCommunity);




export default router;