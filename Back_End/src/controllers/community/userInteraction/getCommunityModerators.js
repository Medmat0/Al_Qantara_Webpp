import {getCommunityModeratorsService} from "../../../services/community/communityMember.service.js";

const getCommunityModerators = async (req, res) => {
    try {
        const moderators = await getCommunityModeratorsService(req);
        res.status(200).json({
            moderators
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération des modérateurs de la communauté."
        });
    }
}

export { getCommunityModerators };