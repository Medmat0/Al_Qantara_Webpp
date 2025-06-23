import {likeOrDislikeCommunityPostService} from "../../services/community/communityPost.service.js";

const likeDislikeCommunityPost = async (req, res) => {
    try {
        const post  = await likeOrDislikeCommunityPostService(req);
        console.log("Post after like/dislike action:", post);
        res.status(200).json({
            message: "Action effectuée avec succès.",
            post: post
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de l'action like/dislike.",
        });
    }
}

export { likeDislikeCommunityPost };