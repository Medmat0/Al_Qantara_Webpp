import {likeOrDislikeCommunityPostService} from "../../services/community/communityPost.service.js";

const likeDislikeCommunityPost = async (req, res) => {
    try {
        const likedPost = await likeOrDislikeCommunityPostService(req);
        res.status(200).json({
            message: "Post liked successfully.",
            post: likedPost
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Error liking the post.",
        });
    }
}

export { likeDislikeCommunityPost };