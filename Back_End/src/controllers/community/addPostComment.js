import {addPostCommentService} from "../../services/community/communityPostComments.service.js";

const addPostComment = async (req, res) => {
    try {
        const addedPostComment =  await addPostCommentService(req);
        res.status(201).json({
            message: "Commentaire ajouté avec succès.",
            comment: addedPostComment
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de l'ajout du commentaire.",
        });
    }
}

export { addPostComment };