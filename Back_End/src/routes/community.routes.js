import express from "express";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";
import {createCommunity} from "../controllers/community/createCommunity.js";
import {uploadlogoCommunities} from "../middleware/storage.middleware.js";
import {getCommunities, getCommunityById, getCommunityByName} from "../controllers/community/getCommunity.js";
import {deleteCommunity} from "../controllers/community/deleteCommunity.js";
import {modifyCommunity} from "../controllers/community/modifyCommunity.js";
import {createCommunityPost} from "../controllers/community/createCommunityPost.js";
import {isMember} from "../middleware/community.middleware.js";
import {joinCommunity} from "../controllers/community/joinCommunity.js";
import {leaveCommunity} from "../controllers/community/leaveCommunity.js";
import {deleteCommunityPost} from "../controllers/community/deleteCommunityPost.js";

const router = express.Router();
// png file for logo of community---------------
router.post("/create", authMiddleware, uploadlogoCommunities.single('logo'), createCommunity)
router.get("/name", getCommunityByName);
router.get("/:communityId", getCommunityById);
router.get("/", getCommunities);
router.patch("/:communityId", authMiddleware, uploadlogoCommunities.single('logo'), modifyCommunity);
router.delete("/:communityId", authMiddleware, deleteCommunity);
// routes for joining and leaving community
router.post("/:communityId/join",authMiddleware,joinCommunity);
router.post("/:communityId/leave", authMiddleware,leaveCommunity);
//routes for posts in community
router.post("/:communityId/posts", authMiddleware, isMember, createCommunityPost);
router.delete("/:communityId/posts/:postId", authMiddleware, deleteCommunityPost);
/*
router.get("/:communityId/posts", getPosts);
router.get("/:communityId/posts/:postId", getPostById);

router.patch("/:communityId/posts/:postId", authMiddleware, updatePost);
 */




export default router;