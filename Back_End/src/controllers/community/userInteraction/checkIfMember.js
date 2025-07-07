import {checkIfMemberService} from "../../../services/community/communityMember.service.js";

const checkIfMember = async (req, res) => {
    try {
        const response = await checkIfMemberService(req);
        res.status(200).json({
            response
        });
    } catch (error) {
        const status = error.status || 500;
        console.error("Error checking if user is a member:", error);
        res.status(status).json({
            message: error.message || "Erreur lors de la vérification de l'appartenance à la communauté."
        });
    }
}

export { checkIfMember };