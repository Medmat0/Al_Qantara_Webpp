import {addCommentToCommentService} from "../../services/community/communityPostComments.service.js";


const addCommentToComment = async (req, res) => {
    try {
        const addedComment = await addCommentToCommentService(req);
        res.status(201).json({
            message: "Commentaire ajouté avec succès.",
            comment: addedComment
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de l'ajout du commentaire.",
        });
    }
}

export { addCommentToComment };