import {leaveCommunityService} from "../../../services/community/community.service.js";


const leaveCommunity = async (req, res) => {
    try {
        const updatedCommunity = await leaveCommunityService(req);
        res.status(200).json({
            message: updatedCommunity
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la tentative de quitter la communauté.",
        });
    }
}

export { leaveCommunity };