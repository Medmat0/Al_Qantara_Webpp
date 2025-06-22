import {modifyCommunityPostService} from "../../services/community/communityPost.service.js";

const modifyCommunityPost = async (req, res) => {
    try {

        const modifiedCommunityPost = await modifyCommunityPostService(req);
        res.status(200).json({
            message: "Post modifié avec succès.",
            community: modifiedCommunityPost
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la modification de la communauté.",
        });
    }
}

export {modifyCommunityPost};