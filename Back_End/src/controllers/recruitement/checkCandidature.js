import { checkCandidatureService } from "../../services/candidature/candidature.service.js";

const checkCandidature = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Candidature requise." });
        }
        const hasApplied = await checkCandidatureService(req);
        res.status(200).json({ hasApplied });
    } catch (error) {
        const status = error.status || 500;
        console.error("Error checking candidature:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la vérification de la candidature."
        });
    }
};

export { checkCandidature };