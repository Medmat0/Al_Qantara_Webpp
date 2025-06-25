import {getCommunityBanishedService} from "../../../services/community/communityMember.service.js";

const getCommunityBanished = async (req, res) => {
    try {
        const banishedMembers = await getCommunityBanishedService(req);
        res.status(200).json({
            banishedMembers
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération des membres bannis."
        });
    }
}

export { getCommunityBanished };