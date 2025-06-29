import {createCommunityPostService} from "../../../services/community/communityPost.service.js";


const createCommunityPost = async (req, res) => {
    try {
        const newCommunityPost = await createCommunityPostService(req);
        res.status(201).json({
            message: "Post created successfully.",
            post: newCommunityPost
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la création du post.",
        });
    }

}

export { createCommunityPost };