import {acceptCandidatureService} from "../../services/candidature/candidature.service.js";

const acceptCandidature = async (req, res) =>{
    try {
        const response = await acceptCandidatureService(req);
        res.status(200).json(response);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error in acceptCandidature:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de l'acceptation de la candidature."
        });
    }
}

export {acceptCandidature}