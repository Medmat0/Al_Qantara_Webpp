import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const isModerator = async (userId, communityId) => {
    const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: { moderateurs: { select: { id: true } } }
    });

    if (!community) {
        return false; // La communauté n'existe pas
    }

    return community.moderateurs.some(moderator => moderator.id === userId);
}


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

    const userId = req.user.id;
    // Vérifie que le post existe
    const post = await prisma.communityPost.findUnique({
        where: { id: postId },
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
        if (req.user.role !== 'ADMIN' && !(await isModerator(userId, communityId))) {
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

    return { message: "Post supprimé avec succès." };

}

export { createCommunityPostService, deleteCommunityPostService };