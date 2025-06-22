import {modifyPostCommentService} from "../../services/community/communityPostComments.service.js";

const modifyPostComment = async (req, res) => {
    try {
        const modifiedComment = await modifyPostCommentService(req);
        res.status(200).json({
            message: "Commentaire modifié avec succès.",
            comment: modifiedComment
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la modification du commentaire.",
        });
    }
}

export { modifyPostComment };