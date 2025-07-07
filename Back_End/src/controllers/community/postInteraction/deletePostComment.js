import {deletePostCommentService} from "../../../services/community/communityPostComments.service.js";

const deletePostComment = async (req, res) => {
    try {
        const deletedCommentResponse = await deletePostCommentService(req);
        res.status(200).json({
            deletedCommentResponse
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la suppression du commentaire.",
        });
    }
}

export { deletePostComment };