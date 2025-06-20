import express from "express";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";
import {createCommunity} from "../controllers/community/createCommunity.js";
import {uploadlogoCommunities} from "../middleware/storage.middleware.js";
import {getCommunities, getCommunityById} from "../controllers/community/getCommunity.js";
import {deleteCommunity} from "../controllers/community/deleteCommunity.js";

const router = express.Router();

router.post("/create", authMiddleware, uploadlogoCommunities.single('logo'), createCommunity)
router.get("/:communityId", getCommunityById);
router.get("/", getCommunities);
// router.patch("/:id",authMiddleware, modifyCommunity);
router.delete("/:communityId", authMiddleware, deleteCommunity);




export default router;