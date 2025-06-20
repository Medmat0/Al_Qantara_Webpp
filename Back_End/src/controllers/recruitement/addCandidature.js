import {addCandidatureService} from "../../services/candidature/candidature.service.js";

/**
 * @desc    Ajouter une candidature à une offre de recrutement
 * @method  POST
 * @route   /:id/apply
 */
const addCandidature = async (req, res) => {
    try {
        const response = await addCandidatureService(req);
        res.status(201).json(response);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error in addCandidature:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de l'ajout de la candidature."
        });
    }
};

export { addCandidature };
