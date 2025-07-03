import {getRandomPostsFromCommunitiesService} from "../../../services/community/community.service.js";


const getRandomPosts = async (req, res) => {
    try {
        const randomPosts = await getRandomPostsFromCommunitiesService(req);
        res.status(200).json({
            message: "Random posts retrieved successfully.",
            posts: randomPosts
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Error retrieving random posts.",
        });
    }
}

export { getRandomPosts };