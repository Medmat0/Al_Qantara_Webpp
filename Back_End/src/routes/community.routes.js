import express from "express";
import { isAdmin, authMiddleware } from "../middleware/auth.middleware.js";
import {createCommunity} from "../controllers/community/createCommunity.js";
import {uploadlogoCommunities} from "../middleware/storage.middleware.js";
import {getCommunities, getCommunityById, getCommunityByName} from "../controllers/community/getCommunity.js";
import {deleteCommunity} from "../controllers/community/deleteCommunity.js";
import {modifyCommunity} from "../controllers/community/modifyCommunity.js";
import {createCommunityPost} from "../controllers/community/createCommunityPost.js";
import {userCommunityRole, isMember} from "../middleware/community.middleware.js";
import {joinCommunity} from "../controllers/community/joinCommunity.js";
import {leaveCommunity} from "../controllers/community/leaveCommunity.js";
import {deleteCommunityPost} from "../controllers/community/deleteCommunityPost.js";
import {modifyCommunityPost} from "../controllers/community/modifyCommunityPost.js";
import {getCommunityPostById, getCommunityPosts} from "../controllers/community/getCommunityPost.js";
import {likeDislikeCommunityPost} from "../controllers/community/likeDislikeCommunityPost.js";
import {addPostComment} from "../controllers/community/addPostComment.js";
import {deletePostComment} from "../controllers/community/deletePostComment.js";
import {modifyPostComment} from "../controllers/community/modifyPostComment.js";
import {likeDislikeCommPostComment} from "../controllers/community/likeDislikeCommPostComment.js";
import {addCommentToCommentService} from "../services/community/communityPostComments.service.js";
import {addCommentToComment} from "../controllers/community/addCommentToComment.js";

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
router.delete("/:communityId/posts/:postId", authMiddleware,userCommunityRole, deleteCommunityPost);
router.patch("/:communityId/posts/:postId", authMiddleware, modifyCommunityPost);
router.post("/:communityId/posts/:postId/likeDislike", authMiddleware,isMember, likeDislikeCommunityPost);
router.get("/:communityId/posts", getCommunityPosts);
router.get("/:communityId/posts/:postId", getCommunityPostById);


//routes for comments in community posts
router.post("/:communityId/posts/:postId/comments", authMiddleware, isMember, addPostComment);
router.delete("/:communityId/posts/:postId/comments/:commentId",authMiddleware,userCommunityRole, deletePostComment);
router.patch("/:communityId/posts/:postId/comments/:commentId",authMiddleware, modifyPostComment);
router.post("/:communityId/posts/:postId/comments/:commentId/likeDislike", authMiddleware,isMember, likeDislikeCommPostComment);
router.post("/:communityId/posts/:postId/comments/:commentId", authMiddleware, isMember, addCommentToComment);

export default router;