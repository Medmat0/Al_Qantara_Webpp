import {getCommunitiesService, getCommunityByIdService} from "../../services/community/community.service.js";


const getCommunityById = async (req, res) => {
    try {
        const community = await getCommunityByIdService(req);
        res.status(200).json(community);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching community by ID:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération de la communauté."
        });
    }
};

const getCommunities = async (req, res) => {
    try {
        const communities = await getCommunitiesService(req);
        res.status(200).json(communities);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching all communities:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération des communautés."
        });
    }
}

export { getCommunityById, getCommunities };