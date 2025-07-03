import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const createCommunityPostService = async (req) => {
    const { titre, contenu, tags, pollOptions, pollDeadline } = req.body;
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

    let newPost;
    if (pollOptions && Array.isArray(pollOptions) && pollOptions.length > 1) {
        if (!pollDeadline) {
            const err = new Error("La date limite du sondage est requise.");
            err.status = 400;
            throw err;
        }
        newPost = await prisma.communityPost.create({
            data: {
                titre,
                contenu,
                tags,
                isPoll: true,
                pollDeadline: new Date(pollDeadline),
                community: { connect: { id: communityId } },
                auteur: { connect: { id: userId } },
                pollOptions: {
                    create: pollOptions.map((label, index) => ({ label, index }))
                }
            },
            include: {
                auteur: { select: { id: true, nom: true, prenom: true } },
                pollOptions: true
            }
        });
    } else {
        newPost = await prisma.communityPost.create({
            data: {
                titre,
                contenu,
                tags,
                community: { connect: { id: communityId } },
                auteur: { connect: { id: userId } }
            },
            include: {
                auteur: { select: { id: true, nom: true, prenom: true } }
            }
        });
    }

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
            community: { select: { id: true, nom: true, logo: true } },
            auteur: { select: { id: true, nom: true, prenom: true } },
            likes: { select: { id: true, utilisateurId: true } },
            commentaires: {
                include: {
                    auteur: { select: { id: true, nom: true, prenom: true } },
                    likes: { select: { id: true, commentaireId: true, utilisateurId: true, dateLike: true } }
                }
            },
            pollOptions: {
                include: {
                    votes: { select: { id: true, utilisateurId: true } }
                }
            }
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

    return {
        ...post,
        communityNom: post.community.nom,
        communityLogo: post.community.logo
    };
}

const getCommunityPostByNameService = async (req) => {
    const postName = req.query.name;
    let tags = req.query.tags;

    if (typeof tags === 'string') {
        tags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }
    if (!Array.isArray(tags)) tags = [];

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if ((typeof postName !== 'string' || postName.trim() === '') && tags.length === 0) {
        const err = new Error("Un mot/phrase de recherche ou au moins un tag est requis dans la query.");
        err.status = 400;
        throw err;
    }

    const where = {};
    if (postName && postName.trim() !== '') {
        where.titre = { contains: postName, mode: 'insensitive' };
    }
    if (tags.length > 0) {
        where.tags = { hasSome: tags };
    }

    const total = await prisma.communityPost.count({ where });

    const posts = await prisma.communityPost.findMany({
        where,
        include: {
            community: { select: { id: true, nom: true, logo: true } },
        },
        orderBy: {
            dateCreation: 'desc'
        },
        skip,
        take: limit
    });

    if (!posts || posts.length === 0) {
        return {
            posts: [],
            page,
            limit,
            total,
            totalPages: 0
        }
    }

    const result = posts.map(post => ({
        ...post,
        communityNom: post.community.nom,
        communityLogo: post.community.logo
    }));

    return {
        posts: result,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
}



const getCommunityPostsService = async (req) => {
    const communityId = parseInt(req.params.communityId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Vérifie que la communauté existe
    const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true, nom: true, logo: true }
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
    const listOfPosts = await prisma.communityPost.findMany({
        where: { communityId: communityId },
        include: {
            auteur: {
                select: { id: true, nom: true, prenom: true }
            },
            likes: true,
            commentaires: true,
            pollOptions: {
                include: {
                    votes: {
                        select: { id: true, utilisateurId: true }
                    }
                }
            }
        },
        orderBy: {
            dateCreation: 'desc'
        },
        skip,
        take: limit
    });

    const posts = listOfPosts.map(post => ({
        ...post,
        communityNom: community.nom,
        communityLogo: community.logo
    }));

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

    const userId = req.user.id;
    const existingLike = post.likes.find(like => like.utilisateurId === userId);

    let like;
    if (existingLike) {
        // Supprime le like
        like = await prisma.communityPostLike.delete({
            where: { id: existingLike.id }
        });
    } else {
        // Ajoute le like
        like = await prisma.communityPostLike.create({
            data: {
                postId: postId,
                utilisateurId: userId
            }
        });
    }

    return like;
}

const addVoteToPollService = async (req) => {
    const postId = parseInt(req.params.postId);
    const communityId = parseInt(req.params.communityId);
    const userId = req.user.id;
    const { pollOptionIndex } = req.body;

    // Vérifie que le post existe et est un sondage
    const post = await prisma.communityPost.findFirst({
        where: { id: postId, communityId: communityId, isPoll: true },
        include: {
            pollOptions: {
                include: {
                    votes: true
                }
            }
        }
    });

    if (!post) {
        const err = new Error("Post non trouvé ou ce n'est pas un sondage.");
        err.status = 404;
        throw err;
    }

    // Vérifie que l'utilisateur n'a pas déjà voté
    const hasVoted = post.pollOptions.some(option =>
        option.votes.some(vote => vote.utilisateurId === userId)
    );
    if (hasVoted) {
        const err = new Error("Vous avez déjà voté pour ce sondage.");
        err.status = 400;
        throw err;
    }

    // Cherche l'option par son index
    const option = post.pollOptions.find(opt => opt.index === pollOptionIndex);
    if (!option) {
        const err = new Error("Option de sondage invalide.");
        err.status = 400;
        throw err;
    }

    // Ajoute le vote
    await prisma.pollVote.create({
        data: {
            pollOptionId: option.id,
            utilisateurId: userId
        }
    });

    return { message: "Vote enregistré avec succès." };
}

export {
    createCommunityPostService,
    deleteCommunityPostService,
    modifyCommunityPostService,
    getCommunityPostByIdService,
    getCommunityPostByNameService,
    getCommunityPostsService,
    likeOrDislikeCommunityPostService,
    addVoteToPollService
};