import {deleteCandidatureService} from "../../services/candidature/candidature.service.js";

const deleteCandidature = async (req, res) => {
    try {
        const response = await deleteCandidatureService(req);
        res.status(200).json(response);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error deleting candidature:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la suppression de la candidature."
        });
    }
};


export { deleteCandidature };