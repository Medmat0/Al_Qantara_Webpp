import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {uploadlogoCommunities, uploadPostImage} from "../middleware/storage.middleware.js";
import { userCommunityRole, isMember, isBanished } from "../middleware/community.middleware.js";

import { createCommunity } from "../controllers/community/community/createCommunity.js";
import { getCommunities, getCommunityById, getCommunityByName } from "../controllers/community/community/getCommunity.js";
import { deleteCommunity } from "../controllers/community/community/deleteCommunity.js";
import { modifyCommunity } from "../controllers/community/community/modifyCommunity.js";
import { joinCommunity } from "../controllers/community/community/joinCommunity.js";
import { leaveCommunity } from "../controllers/community/community/leaveCommunity.js";
import { getRandomPosts } from "../controllers/community/community/getRandomPosts.js";

import { createCommunityPost } from "../controllers/community/communityPost/createCommunityPost.js";
import { deleteCommunityPost } from "../controllers/community/communityPost/deleteCommunityPost.js";
import { modifyCommunityPost } from "../controllers/community/communityPost/modifyCommunityPost.js";
import {
    getCommunityPostById,
    getCommunityPostByName,
    getCommunityPosts
} from "../controllers/community/communityPost/getCommunityPost.js";
import { likeDislikeCommunityPost } from "../controllers/community/postInteraction/likeDislikeCommunityPost.js";

import { addPostComment } from "../controllers/community/postInteraction/addPostComment.js";
import { deletePostComment } from "../controllers/community/postInteraction/deletePostComment.js";
import { modifyPostComment } from "../controllers/community/postInteraction/modifyPostComment.js";
import { likeDislikeCommPostComment } from "../controllers/community/postInteraction/likeDislikeCommPostComment.js";
import { addCommentToComment } from "../controllers/community/postInteraction/addCommentToComment.js";
import { addVoteToPoll } from "../controllers/community/postInteraction/addVoteToPoll.js";

import { getCommunityMembers } from "../controllers/community/userInteraction/getCommunityMembers.js";
import { promoteMember } from "../controllers/community/userInteraction/promoteMember.js";
import { banMember } from "../controllers/community/userInteraction/banMember.js";
import { demoteModerator } from "../controllers/community/userInteraction/demoteModerator.js";
import { unBanMember } from "../controllers/community/userInteraction/unBanMember.js";
import { getCommunityModerators } from "../controllers/community/userInteraction/getCommunityModerators.js";
import { getCommunityBanished } from "../controllers/community/userInteraction/getCommunityBanished.js";
import {getRandomCommunities} from "../controllers/community/community/getRandomCommunities.js";
import {checkIfMember} from "../controllers/community/userInteraction/checkIfMember.js";
import {checkIfModerator} from "../controllers/community/userInteraction/checkIfModerator.js";

const router = express.Router();



router.get("/name", getCommunityByName);
router.get("/posts/name", getCommunityPostByName);
router.get("/", getCommunities);
router.post("/create", authMiddleware, uploadlogoCommunities.single('logo'), createCommunity);
router.get("/randomCommunities", getRandomCommunities);
router.get("/randomPosts", getRandomPosts);

// ----------------- Routes communautaires (avec ID dynamique) -----------------

router.get("/:communityId", getCommunityById);
router.get("/:communityId/isMember",authMiddleware, checkIfMember);
router.get("/:communityId/isModerator", authMiddleware,userCommunityRole, checkIfModerator);
router.patch("/:communityId", authMiddleware, uploadlogoCommunities.single('logo'), modifyCommunity);
router.delete("/:communityId", authMiddleware, deleteCommunity);

// ----------------- Membre / rôles -----------------

router.get("/:communityId/members", authMiddleware, userCommunityRole, getCommunityMembers);
router.post("/:communityId/members/:memberId/promote", authMiddleware, userCommunityRole, promoteMember);
router.post("/:communityId/members/:memberId/ban", authMiddleware, userCommunityRole, banMember);
router.delete("/:communityId/members/:memberId/unban", authMiddleware, userCommunityRole, unBanMember);
router.get("/:communityId/members/banished", authMiddleware, userCommunityRole, getCommunityBanished);
router.get("/:communityId/moderateurs", authMiddleware, userCommunityRole, getCommunityModerators);
router.delete("/:communityId/moderateurs/:moderatorId/demote", authMiddleware, userCommunityRole, demoteModerator);

// ----------------- Rejoindre / quitter -----------------

router.post("/:communityId/join", authMiddleware, isBanished, joinCommunity);
router.post("/:communityId/leave", authMiddleware, isBanished, leaveCommunity);

// ----------------- Posts -----------------

router.post("/:communityId/posts", authMiddleware, isBanished, isMember, uploadPostImage.single('img'), createCommunityPost);
router.delete("/:communityId/posts/:postId", authMiddleware, isBanished, userCommunityRole, deleteCommunityPost);
router.patch("/:communityId/posts/:postId", authMiddleware, isBanished, modifyCommunityPost);
router.get("/:communityId/posts", getCommunityPosts);
router.get("/:communityId/posts/:postId", getCommunityPostById);
router.post("/:communityId/posts/:postId/likeDislike", authMiddleware, isBanished, isMember, likeDislikeCommunityPost);

// ----------------- Commentaires -----------------

router.post("/:communityId/posts/:postId/comments", authMiddleware, isBanished, isMember, addPostComment);
router.delete("/:communityId/posts/:postId/comments/:commentId", authMiddleware, isBanished, userCommunityRole, deletePostComment);
router.patch("/:communityId/posts/:postId/comments/:commentId", authMiddleware, isBanished, modifyPostComment);
router.post("/:communityId/posts/:postId/comments/:commentId/likeDislike", authMiddleware, isBanished, isMember, likeDislikeCommPostComment);
router.post("/:communityId/posts/:postId/comments/:commentId", authMiddleware, isBanished, isMember, addCommentToComment);

// ----------------- Sondage -----------------

router.post("/:communityId/posts/:postId/addVote", authMiddleware, isBanished, isMember, addVoteToPoll);

export default router;