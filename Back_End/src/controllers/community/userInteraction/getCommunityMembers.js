import {getCommunityMembersService} from "../../../services/community/community.service.js";

const getCommunityMembers = async (req, res) => {
    try{
        const communityMembers = await getCommunityMembersService(req);
        res.status(200).json(communityMembers);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching community members:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération des membres de la communauté."
        });
    }
}

export {getCommunityMembers};