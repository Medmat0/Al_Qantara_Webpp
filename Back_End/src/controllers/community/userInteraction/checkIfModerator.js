import {checkIfModeratorService} from "../../../services/community/communityMember.service.js";

const checkIfModerator = async (req, res, next) => {
    try {
        const isModerator = await checkIfModeratorService(req);
        res.status(200).json({
            isModerator,
            communityName: req.params.communityId
        });
    } catch (error) {
        const status = error.status || 500;
        console.error("Error checking moderator status:", error);
        res.status(status).json({
            message: error.message || "An error occurred while checking moderator status."
        });
    }
}

export { checkIfModerator };