import {deleteCommunityPostService} from "../../services/community/communityPost.service.js";


const deleteCommunityPost = async (req, res) => {
    try {
        const deletionResponse = await deleteCommunityPostService(req);
        res.status(200).json({
            deletionResponse
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Error lors de la suppression du post.",
        });
    }
}

export { deleteCommunityPost };