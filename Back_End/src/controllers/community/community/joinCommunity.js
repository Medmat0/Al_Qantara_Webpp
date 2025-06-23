import {joinCommunityService} from "../../../services/community/community.service.js";


const joinCommunity = async (req, res) => {
    try {
        const updatedCommunity = await joinCommunityService(req);
        res.status(201).json({
            message: updatedCommunity
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la tentative de rejoindre la communauté.",
        });
    }
}

export { joinCommunity };