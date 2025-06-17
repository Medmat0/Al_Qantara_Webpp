import {deleteCandidatureService} from "../../services/candidature/candidature.service.js";

const deleteCandidature = async (req, res) => {
    try {
        const response = await deleteCandidatureService(req);
        res.status(200).json(response);
    } catch (error) {
        console.error("Erreur lors de la suppression de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de la suppression de la candidature.",
            error: error.message,
        });
    }
};


export { deleteCandidature };