import {
    getCommunityPostByIdService, getCommunityPostByNameService,
    getCommunityPostsService
} from "../../../services/community/communityPost.service.js";


const getCommunityPostById = async (req, res) => {
    try {
        const communityPost = await getCommunityPostByIdService(req);
        res.status(200).json(communityPost);

    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching community post by ID:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération du post de la communauté."
        });
    }
}

const getCommunityPosts = async (req, res) => {
    try {
        const communityPosts = await getCommunityPostsService(req);
        res.status(200).json(communityPosts);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching all community posts:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération des posts de la communauté."
        });
    }
}

const getCommunityPostByName = async (req, res) => {
    try {
        const communityPost = await getCommunityPostByNameService(req);
        return res.status(200).json(communityPost);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching community post by name:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération du post de la communauté."
        });
    }
}

export { getCommunityPostById, getCommunityPosts, getCommunityPostByName };