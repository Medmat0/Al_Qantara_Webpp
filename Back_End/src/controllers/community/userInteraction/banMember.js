import {banMemberService} from "../../../services/community/communityMember.service.js";

const banMember = async (req, res) => {
    try {
        const bannishedResponse = await banMemberService(req);
        res.status(200).json({
            bannishedResponse
        });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors du bannissement du membre."
        });
    }
}

export { banMember };