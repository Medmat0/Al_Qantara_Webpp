import {addCandidatureService} from "../../services/candidature/candidature.service.js";

/**
 * @desc    Ajouter une candidature à une offre de recrutement
 * @method  POST
 * @route   /:id/apply
 */
const addCandidature = async (req, res) => {
    try {
        const response = await addCandidatureService(req);
        res.status(200).json(response);
    } catch (error) {
        console.error("Erreur lors de l'ajout de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de la candidature.",
            error: error.message,
        });
    }
};

export { addCandidature };
