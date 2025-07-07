import {modifyCommunityService} from "../../../services/community/community.service.js";


const modifyCommunity = async (req, res) => {
    try {
        const response = await modifyCommunityService(req);

        res.status(200).json({
            message: response
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la modification de la communauté."
        });
    }
}

export {modifyCommunity};