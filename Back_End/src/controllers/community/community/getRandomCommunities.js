import {getRandomCommunitiesFromService} from "../../../services/community/community.service.js";

const getRandomCommunities = async (req, res) => {
    try {
        const randomCommunities = await getRandomCommunitiesFromService(req);
        res.status(200).json({
            message: "Random communities retrieved successfully.",
            communities: randomCommunities
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Error retrieving random communities.",
        });
    }
}

export { getRandomCommunities };