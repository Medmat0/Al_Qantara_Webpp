import {acceptCandidatureService} from "../../services/candidature/candidature.service.js";


const acceptCandidature = async (req, res) => {
    try {
        const acceptanceResponse = await acceptCandidatureService(req);
        res.status(200).json(acceptanceResponse);
    } catch (error) {
        console.error("Erreur lors de l'acceptation de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de l'acceptation de la candidature.",
            error: error.message,
        });
    }
};

export { acceptCandidature };