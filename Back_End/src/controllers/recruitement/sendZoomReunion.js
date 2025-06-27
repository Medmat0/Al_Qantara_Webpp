import {sendZoomReunionService} from "../../services/candidature/candidature.service.js";


const sendZoomReunion = async (req, res) => {
    try {
        const acceptanceResponse = await sendZoomReunionService(req);
        res.status(200).json(acceptanceResponse);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error accepting candidature:", error);

        res.status(status).json({
            message: error.message || " Erreur lors de l'acceptation de la candidature."
        });
    }
};

export { sendZoomReunion };