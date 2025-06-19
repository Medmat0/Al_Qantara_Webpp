import {refuseCandidatureService} from "../../services/candidature/candidature.service.js";


const refuseCandidature = async (req, res) => {
    try {
        const refusalResponse = await refuseCandidatureService(req);
        res.status(200).json(refusalResponse);
    }catch (error) {
        console.error("Erreur lors du refus de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors du refus de la candidature.",
            error: error.message,
        });
    }
}

export { refuseCandidature };