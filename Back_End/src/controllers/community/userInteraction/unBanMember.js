import {unbanMemberService} from "../../../services/community/communityMember.service.js";

const unBanMember = async (req, res) => {
    try {
        const unbannedResponse = await unbanMemberService(req);
        res.status(200).json({
            unbannedResponse
        });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors du dé-bannissement du membre."
        });
    }
}

export { unBanMember };