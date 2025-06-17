import {
    getAllCandidaturesByOfferIdService,
    getAllCandidaturesByUserIdService, getCandidatureByIdService
} from "../../services/candidature/candidature.service.js";

const getCandidatureById = async (req, res) => {
    try {
        const candidature = await getCandidatureByIdService(req);
        res.status(200).json(candidature);
    } catch (error) {
        console.error("Erreur lors de la récupération de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération de la candidature.",
            error: error.message,
        });
    }
};

const getAllCandidaturesByUserId = async (req, res) => {
    try {
        const candidatures = await getAllCandidaturesByUserIdService(req);
        res.status(200).json(candidatures);
    } catch (error) {
        console.error("Erreur lors de la récupération des candidatures:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des candidatures.",
            error: error.message,
        });
    }
};

const getAllCandidaturesByOfferId = async (req, res) => {
    try {
        const candidatures = await getAllCandidaturesByOfferIdService(req);
        res.status(200).json(candidatures);
    } catch (error) {
        console.error("Erreur lors de la récupération des candidatures pour l'offre:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des candidatures pour l'offre.",
            error: error.message,
        });
    }
};

export {getAllCandidaturesByOfferId, getAllCandidaturesByUserId, getCandidatureById};