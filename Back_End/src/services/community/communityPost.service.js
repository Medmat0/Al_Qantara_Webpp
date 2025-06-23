import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const createCommunityPostService = async (req) => {
    const { titre, contenu, tags } = req.body;
    const communityId = parseInt(req.params.communityId);
    const userId = req.user.id;
    if (!titre || !contenu || (!tags || tags.length === 0)) {
        const err = new Error("Le titre et le contenu du post sont requis, au moins un tag doit être fourni.");
        err.status = 400;
        throw err;
    }

    // Vérifie que la communauté existe
    const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    // Crée le post

    const newPost = await prisma.communityPost.create({
        data: {
            titre,
            contenu,
            tags,
            community: {
                connect: { id: communityId }
            },
            auteur: {
                connect: { id: userId }
            }
        },
        include: {
            auteur: {
                select: { id: true, nom: true, prenom: true }
            },
        }
    });

    return newPost;

}

const deleteCommunityPostService = async (req) => {
    const postId = parseInt(req.params.postId);
    const communityId = parseInt(req.params.communityId);
    const userCommunityRole = req.userCommunityRole;

    const userId = req.user.id;
    // Vérifie que le post existe
    const post = await prisma.communityPost.findFirst({
        where: { id: postId, communityId: communityId },
        include: {
            community: {
                select: { id: true }
            },
            auteur: {
                select: { id: true }
            }
        }
    });

    if (!post) {
        const err = new Error("Post non trouvé.");
        err.status = 404;
        throw err;
    }
    // Vérifie que l'utilisateur est l'auteur du post, un admin ou un modérateur de la communauté
    if (post.auteur.id !== userId) {
        if (userCommunityRole !== "ADMIN" && userCommunityRole !== "MODERATEUR") {
            const err = new Error("Vous n'êtes pas autorisé à supprimer ce post.");
            err.status = 403;
            throw err;
        }

        if (post.community.id !== communityId) {
            const err = new Error("Ce post n'appartient pas à cette communauté.");
            err.status = 403;
            throw err;
        }

    }
    // Supprime le post
    await prisma.communityPost.delete({
        where: { id: postId }
    });

    return { message: "Post supprimé avec succès.",
        communityPostId: postId
    };
}

const modifyCommunityPostService = async (req) => {
    const postId = parseInt(req.params.postId);
    const { titre, contenu, tags } = req.body;
    const communityId = parseInt(req.params.communityId);
    const userId = req.user.id;

    if (!titre || !contenu || (!tags || tags.length === 0)) {
        const err = new Error("Le titre et le contenu du post sont requis, au moins un tag doit être fourni.");
        err.status = 400;
        throw err;
    }

    // Vérifie que le post existe
    const post = await prisma.communityPost.findFirst({
        where: { id: postId, communityId: communityId },
        include: {
            community: {
                select: { id: true }
            },
            auteur: {
                select: { id: true }
            }
        }
    });

    if (!post) {
        const err = new Error("Post non trouvé.");
        err.status = 404;
        throw err;
    }

    // Vérifie que l'utilisateur est l'auteur du post
    if (post.auteur.id !== userId) {
        const err = new Error("Vous n'êtes pas autorisé à modifier ce post.");
        err.status = 403;
        throw err;
    }

    if (post.community.id !== parseInt(req.params.communityId)) {
        const err = new Error("Ce post n'appartient pas à cette communauté.");
        err.status = 403;
        throw err;
    }

    // Met à jour le post
    const updatedPost = await prisma.communityPost.update({
        where: { id: postId },
        data: {
            titre,
            contenu,
            tags,
            modified: true
        },
        include: {
            auteur: {
                select: { id: true, nom: true, prenom: true }
            }
        }
    });

    return updatedPost;
}


const getCommunityPostByIdService = async (req) => {
    const postId = parseInt(req.params.postId);
    const communityId = parseInt(req.params.communityId);

    // Vérifie que le post existe
    const post = await prisma.communityPost.findFirst({
        where: { id: postId, communityId: communityId },
        include: {
            community: {
                select: { id: true }
            },
            likes: {
                select: { id: true, utilisateurId: true }
            },
            commentaires: true
        }
    });

    if (!post) {
        const err = new Error("Post non trouvé.");
        err.status = 404;
        throw err;
    }

    // Vérifie que le post appartient à la communauté
    if (post.community.id !== communityId) {
        const err = new Error("Ce post n'appartient pas à cette communauté.");
        err.status = 403;
        throw err;
    }

    return post;

}

const getCommunityPostsService = async (req) => {
    const communityId = parseInt(req.params.communityId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Vérifie que la communauté existe
    const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    // Récupère le nombre total de posts
    const total = await prisma.communityPost.count({
        where: { communityId: communityId }
    });

    // Récupère les posts de la communauté avec pagination
    const posts = await prisma.communityPost.findMany({
        where: { communityId: communityId },
        include: {
            auteur: {
                select: { id: true, nom: true, prenom: true }
            },
            likes: true,
            commentaires: true
        },
        orderBy: {
            dateCreation: 'desc'
        },
        skip,
        take: limit
    });

    return {
        posts,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
}

const likeOrDislikeCommunityPostService = async (req) => {
    const postId = parseInt(req.params.postId);
    const communityId = parseInt(req.params.communityId);

    // Vérifie que le post existe
    const post = await prisma.communityPost.findFirst({
        where: { id: postId, communityId: communityId },
        include: {
            likes: {
                select: { id: true, utilisateurId: true }
            }
        }
    });

    if (!post) {
        const err = new Error("Post non trouvé.");
        err.status = 404;
        throw err;
    }

    // Vérifie si l'utilisateur a déjà liké le post
    const userId = req.user.id;
    const existingLike = post.likes.find(like => like.utilisateurId === userId);

    if (existingLike) {
        // Supprime le like
        await prisma.communityPostLike.delete({
            where: { id: existingLike.id }
        });
    } else {
        // Ajoute le like
        await prisma.communityPostLike.create({
            data: {
                postId: postId,
                utilisateurId: userId
            }
        });
    }

    // Retourne le post avec les likes mis à jour
    const postWithLikes = await prisma.communityPost.findUnique({
        where: { id: postId },
        include: {
            likes: true,
            auteur: {
                select: { id: true, nom: true, prenom: true }
            }
        }
    });
    return postWithLikes;
}



export {
    createCommunityPostService,
    deleteCommunityPostService,
    modifyCommunityPostService,
    getCommunityPostByIdService,
    getCommunityPostsService,
    likeOrDislikeCommunityPostService
};