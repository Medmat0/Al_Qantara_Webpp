import {createCommunityService} from "../../../services/community/community.service.js";


const createCommunity = async (req, res) => {
    try {

        const newCommunity = await createCommunityService(req);
        res.status(201).json({
        message: "Communauté créée avec succès.",
        community: newCommunity
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la création de la communauté.",
        });
    }
}


export {createCommunity};