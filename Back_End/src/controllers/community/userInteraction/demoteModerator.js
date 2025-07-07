import {demoteModeratorService} from "../../../services/community/communityMember.service.js";

const demoteModerator = async (req, res) => {
    try {
        const demotedResponse = await demoteModeratorService(req);
        res.status(200).json({
            demotedResponse
        });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la rétrogradation du membre."
        });
    }
}

export { demoteModerator };