import {PrismaClient} from '@prisma/client';
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();



const addPostCommentService = async (req) => {
    const { content } = req.body;
    const postId = parseInt(req.params.postId);
    const communityId = parseInt(req.params.communityId);
    const userId = req.user.id;

    // Vérifie que le post existe
    const post = await prisma.communityPost.findFirst({
        where: { id: postId, communityId: communityId },
    });

    if (!post) {
        const err = new Error("Post non trouvé.");
        err.status = 404;
        throw err;
    }

    // Ajout du commentaire
    const createdComment = await prisma.communityPostCommentaire.create({
        data: {
            contenu: content,
            postId: postId,
            auteurId: userId
        },
        include: {
            auteur: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true
                }
            },
            likes: true,
            replies: {
                include: {
                    auteur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true
                        }
                    },
                    likes: true
                }
            }
        }
    });

    return createdComment;
}

const deletePostCommentService = async (req) => {
    const commentId = parseInt(req.params.commentId);
    const postId = parseInt(req.params.postId);
    const communityId = parseInt(req.params.communityId);
    const userCommunityRole = req.userCommunityRole;
    const userId = req.user.id;

    // Vérifie que le commentaire existe et qu'il appartient au bon post et à la bonne communauté
    const comment = await prisma.communityPostCommentaire.findFirst({
        where: { id: commentId, postId: postId },
        include: { auteur: true, post: true }
    });

    if (!comment || comment.post.communityId !== communityId) {
        const err = new Error("Commentaire non trouvé.");
        err.status = 404;
        throw err;
    }

    // Vérifie que l'utilisateur est l'auteur du commentaire ou un modérateur
    if (comment.auteurId !== userId && userCommunityRole !== "MODERATEUR") {
        const err = new Error("Vous n'êtes pas autorisé à supprimer ce commentaire.");
        err.status = 403;
        throw err;
    }

    // Supprime le commentaire
    await prisma.communityPostCommentaire.delete({
        where: { id: commentId }
    });

    return {
        message: "Commentaire supprimé avec succès.",
        commentId: commentId
    };
}

const modifyPostCommentService = async (req) => {
    const { content } = req.body;
    const commentId = parseInt(req.params.commentId);
    const postId = parseInt(req.params.postId);
    const communityId = parseInt(req.params.communityId);

    const userId = req.user.id;

    // Vérifie que le commentaire existe et qu'il appartient au bon post et à la bonne communauté
    const comment = await prisma.communityPostCommentaire.findFirst({
        where: { id: commentId, postId: postId },
        include: { auteur: true, post: true }
    });

    if (!comment || comment.post.communityId !== communityId) {
        const err = new Error("Commentaire non trouvé.");
        err.status = 404;
        throw err;
    }

    // Vérifie que l'utilisateur est l'auteur du commentaire
    if (comment.auteurId !== userId) {
        const err = new Error("Vous n'êtes pas autorisé à modifier ce commentaire.");
        err.status = 403;
        throw err;
    }

    // Modifie le commentaire
    const updatedComment = await prisma.communityPostCommentaire.update({
        where: { id: commentId },
        data: { contenu: content , modified:true}
    });

    // Retourne le commentaire modifié
    return {
        message: "Commentaire modifié avec succès.",
        comment: updatedComment
    };
}

const likeDislikePostCommentService = async (req) => {
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id;

    // Vérifie que le commentaire existe
    const comment = await prisma.communityPostCommentaire.findFirst({
        where: { id: commentId },
    });

    if (!comment) {
        const err = new Error("Commentaire non trouvé.");
        err.status = 404;
        throw err;
    }

    // Vérifie si l'utilisateur a déjà liké le commentaire
    const existingLike = await prisma.communityPostCommentaireLike.findFirst({
        where: { commentaireId: commentId, utilisateurId: userId }
    });

    let like = null;
    if (existingLike) {
        // Si l'utilisateur a déjà liké, on supprime le like
        await prisma.communityPostCommentaireLike.delete({
            where: { id: existingLike.id }
        });
    } else {
        like = await prisma.communityPostCommentaireLike.create({
            data: {
                commentaireId: commentId,
                utilisateurId: userId
            }
        });
    }

    return like;
}

const addCommentToCommentService = async (req) => {
    const { content } = req.body;
    const postId = parseInt(req.params.postId);
    const commentId = parseInt(req.params.commentId);
    const communityId = parseInt(req.params.communityId);
    const userId = req.user.id;

    // Vérifie que le post existe
    const post = await prisma.communityPost.findFirst({
        where: { id: postId, communityId: communityId },
    });

    if (!post) {
        const err = new Error("Post non trouvé.");
        err.status = 404;
        throw err;
    }

    // Vérifie que le commentaire existe
    const parentComment = await prisma.communityPostCommentaire.findFirst({
        where: { id: commentId, postId: postId },
    });

    if (!parentComment) {
        const err = new Error("Commentaire parent non trouvé.");
        err.status = 404;
        throw err;
    }

    // Ajout du commentaire en réponse
    const createdReply = await prisma.communityPostCommentaire.create({
        data: {
            contenu: content,
            postId: postId,
            auteurId: userId,
            parentId: commentId
        },
        include: {
            auteur: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true
                }
            },
            likes: true,
            replies: {
                include: {
                    auteur: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true
                        }
                    },
                    likes: true
                }
            }
        }
    });

    return createdReply;
}
export {
    addPostCommentService,
    deletePostCommentService,
    modifyPostCommentService,
    likeDislikePostCommentService,
    addCommentToCommentService

};