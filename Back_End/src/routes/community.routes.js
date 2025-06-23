import express from "express";
import {authMiddleware } from "../middleware/auth.middleware.js";
import {createCommunity} from "../controllers/community/community/createCommunity.js";
import {uploadlogoCommunities} from "../middleware/storage.middleware.js";
import {getCommunities, getCommunityById, getCommunityByName} from "../controllers/community/community/getCommunity.js";
import {deleteCommunity} from "../controllers/community/community/deleteCommunity.js";
import {modifyCommunity} from "../controllers/community/community/modifyCommunity.js";
import {createCommunityPost} from "../controllers/community/communityPost/createCommunityPost.js";
import {userCommunityRole, isMember, isBanished} from "../middleware/community.middleware.js";
import {joinCommunity} from "../controllers/community/community/joinCommunity.js";
import {leaveCommunity} from "../controllers/community/community/leaveCommunity.js";
import {deleteCommunityPost} from "../controllers/community/communityPost/deleteCommunityPost.js";
import {modifyCommunityPost} from "../controllers/community/communityPost/modifyCommunityPost.js";
import {getCommunityPostById, getCommunityPosts} from "../controllers/community/communityPost/getCommunityPost.js";
import {likeDislikeCommunityPost} from "../controllers/community/postInteraction/likeDislikeCommunityPost.js";
import {addPostComment} from "../controllers/community/postInteraction/addPostComment.js";
import {deletePostComment} from "../controllers/community/postInteraction/deletePostComment.js";
import {modifyPostComment} from "../controllers/community/postInteraction/modifyPostComment.js";
import {likeDislikeCommPostComment} from "../controllers/community/postInteraction/likeDislikeCommPostComment.js";
import {addCommentToComment} from "../controllers/community/postInteraction/addCommentToComment.js";
import {addVoteToPoll} from "../controllers/community/postInteraction/addVoteToPoll.js";
import {getCommunityMembers} from "../controllers/community/userInteraction/getCommunityMembers.js";
import {promoteMember} from "../controllers/community/userInteraction/promoteMember.js";
import {banMember} from "../controllers/community/userInteraction/banMember.js";

const router = express.Router();

//routes for admin and moderator actions
router.get("/:communityId/members", authMiddleware, userCommunityRole, getCommunityMembers);
router.post("/:communityId/members/:memberId/promote", authMiddleware,userCommunityRole, promoteMember);
router.post("/:communityId/members/:memberId/ban", authMiddleware,userCommunityRole, banMember);
/*
router.get("/:communityId/moderateurs", authMiddleware, userCommunityRole, getCommunityModerators);
router.delete("/:communityId/moderateurs/:moderateurId/demote", authMiddleware,userCommunityRole, demoteModerator);
router.delete("/:communityId/members/:memberId/unban", authMiddleware,userCommunityRole, unbanMember);
 */

// png file for logo of community---------------
router.post("/create", authMiddleware, uploadlogoCommunities.single('logo'), createCommunity)
router.get("/name", getCommunityByName);
router.get("/:communityId", getCommunityById);
router.get("/", getCommunities);

router.patch("/:communityId", authMiddleware, uploadlogoCommunities.single('logo'), modifyCommunity);
router.delete("/:communityId", authMiddleware, deleteCommunity);

// routes for joining and leaving community
router.post("/:communityId/join",authMiddleware,isBanished,joinCommunity);
router.post("/:communityId/leave", authMiddleware,isBanished,leaveCommunity);

//routes for posts in community
router.post("/:communityId/posts", authMiddleware,isBanished,isMember, createCommunityPost);
router.delete("/:communityId/posts/:postId", authMiddleware,isBanished,userCommunityRole, deleteCommunityPost);
router.patch("/:communityId/posts/:postId", authMiddleware,isBanished,modifyCommunityPost);
router.post("/:communityId/posts/:postId/likeDislike", authMiddleware,isBanished,isMember, likeDislikeCommunityPost);
router.get("/:communityId/posts",getCommunityPosts);
router.get("/:communityId/posts/:postId", getCommunityPostById);

//routes for comments in community posts
router.post("/:communityId/posts/:postId/comments", authMiddleware, isBanished, isMember, addPostComment);
router.delete("/:communityId/posts/:postId/comments/:commentId",authMiddleware, isBanished, userCommunityRole, deletePostComment);
router.patch("/:communityId/posts/:postId/comments/:commentId",authMiddleware, isBanished, modifyPostComment);

// interaction with the post
router.post("/:communityId/posts/:postId/comments/:commentId/likeDislike", authMiddleware, isBanished, isMember, likeDislikeCommPostComment);
router.post("/:communityId/posts/:postId/comments/:commentId", authMiddleware, isBanished, isMember, addCommentToComment);
router.post("/:communityId/posts/:postId/addVote", authMiddleware, isBanished, isMember, addVoteToPoll);



export default router;