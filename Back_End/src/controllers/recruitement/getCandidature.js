import {
    getAllCandidaturesByOfferIdService,
    getAllCandidaturesByUserIdService, getCandidatureByIdService
} from "../../services/candidature/candidature.service.js";

const getCandidatureById = async (req, res) => {
    try {
        const candidature = await getCandidatureByIdService(req);
        res.status(200).json(candidature);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching candidature by ID:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la récupération de la candidature.",
        });
    }
};

const getAllCandidaturesByUserId = async (req, res) => {
    try {
        const candidatures = await getAllCandidaturesByUserIdService(req);
        res.status(200).json(candidatures);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching candidatures by user ID:", error);
        res.status(status).json({
            message: error.message,
            error: error.message
        });
    }
};

const getAllCandidaturesByOfferId = async (req, res) => {
    try {
        const candidatures = await getAllCandidaturesByOfferIdService(req);
        res.status(200).json(candidatures);
    } catch (error) {
        const status = error.status || 500;
        console.error("Error fetching candidatures by offer ID:", error);
        res.status(status).json({
            message: error.message,
            error: error.message
        });
    }
};

export {getAllCandidaturesByOfferId, getAllCandidaturesByUserId, getCandidatureById};