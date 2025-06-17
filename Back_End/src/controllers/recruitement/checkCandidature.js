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
        console.error("Erreur lors de la vérification de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de la vérification de la candidature.",
            error: error.message,
        });
    }
};

export { checkCandidature };