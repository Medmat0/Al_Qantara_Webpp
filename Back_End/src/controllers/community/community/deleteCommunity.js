import {deleteCommunityService} from "../../../services/community/community.service.js";


const deleteCommunity = async (req, res) => {
    try {
         const response = await deleteCommunityService(req);

        res.status(200).json({
            message: response
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la suppression de la communauté."
        });
    }
}

export { deleteCommunity };