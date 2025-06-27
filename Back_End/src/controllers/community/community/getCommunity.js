import {
    getCommunitiesService,
    getCommunityByIdService,
    getCommunityByNameService
} from "../../../services/community/community.service.js";


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

const getCommunityByName = async (req, res) => {

    try {
        const community = await getCommunityByNameService(req);
        return res.status(200).json(community);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching community by name:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération de la communauté."
        });
    }
}

export { getCommunityById, getCommunities, getCommunityByName };