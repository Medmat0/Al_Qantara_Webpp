import {refuseCandidatureService} from "../../services/candidature/candidature.service.js";


const refuseCandidature = async (req, res) => {
    try {
        const refusalResponse = await refuseCandidatureService(req);
        res.status(200).json(refusalResponse);
    }catch (error) {
        const status = error.status || 500;
        console.error("Error refusing candidature:", error);
        res.status(status).json({
            message: error.message || "Erreur lors du refus de la candidature."
        });
    }
}

export { refuseCandidature };