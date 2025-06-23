import {likeDislikePostCommentService} from "../../services/community/communityPostComments.service.js";

const likeDislikeCommPostComment = async (req, res) => {
    try {
        const comment = await likeDislikePostCommentService(req);
        res.status(200).json({
            message: "Action effectuée avec succès.",
            comment: comment
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de l'action sur le commentaire.",
        });
    }
}

export { likeDislikeCommPostComment };