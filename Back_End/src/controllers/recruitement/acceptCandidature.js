import {acceptCandidatureService} from "../../services/candidature/candidature.service.js";


const acceptCandidature = async (req, res) => {
    try {
        const acceptanceResponse = await acceptCandidatureService(req);
        res.status(200).json(acceptanceResponse);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error accepting candidature:", error);

        res.status(status).json({
            message: error.message,
            error: error.message
        });
    }
};

export { acceptCandidature };