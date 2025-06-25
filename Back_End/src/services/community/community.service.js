import {PrismaClient} from '@prisma/client';
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();


const createCommunityService = async(req) => {

    const { nom, description } = req.body;
    const logo = req.file;
    const userId = req.user.id;

    // Vérification du rôle utilisateur
    const user = await prisma.utilisateur.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (user.role !== "ADMIN" && user.role !== "ADHERENT") {
        const err = new Error("Vous n'avez pas les droits nécessaires pour créer une communauté.");
        err.status = 403;
        throw err;
    }

    // Vérification si une communauté avec le même nom existe déjà
    const existingCommunity = await prisma.community.findFirst({
        where: {
            nom: {
                equals: nom,
                mode: 'insensitive'
            }
        }
    });

    if (existingCommunity) {
        const err = new Error("Une communauté avec ce nom existe déjà.");
        err.status = 409;
        throw err;
    }

    // Upload image to Cloudinary
    let imageUrl = null;
    if (logo) {
        const uploadResult = await cloudinary.uploader.upload(logo.path, {
            folder: 'logoCommunities',
            resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
    }
    // Création de la communauté + ajout du créateur en tant que modérateur d'office
    const newCommunity = await prisma.community.create({
        data: {
            nom,
            description,
            logo: imageUrl,
            createdBy: userId,
            moderateurs: {
                connect: { id: userId }
            }
        }
    });

    return newCommunity;
}

const getCommunityByIdService = async (req) => {
    const { communityId } = req.params;

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        select: {
            id: true,
            nom: true,
            logo: true,
            description: true,
            createdBy: true,
            dateCreation: true
        }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    return community;
}

const getCommunitiesService = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [total, communities] = await Promise.all([
        prisma.community.count(),
        prisma.community.findMany({
            skip,
            take: limit,
            orderBy: { dateCreation: 'desc' },
            select: {
                id: true,
                nom: true,
                logo: true,
                description: true,
                createdBy: true,
                dateCreation: true
            }
        })
    ]);

    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        communities
    };
}


const getCommunityByNameService = async (req) => {
    const { name } = req.query;
    console.log(name);

    if (!name) {
        const err = new Error("Le nom de la communauté est requis.");
        err.status = 400;
        throw err;
    }

    const community = await prisma.community.findUnique({
        where: { nom: name },
        select: {
            id: true,
            nom: true,
            logo: true,
            description: true,
            createdBy: true,
            dateCreation: true
        }
    });

    if (!community) {
        const err = new Error("Aucune communauté avec ce nom trouvée.");
        err.status = 404;
        throw err;
    }

    return community;
};

const deleteCommunityService = async (req) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId },
        select: { role: true,
            moderateurCommunity:true
        }
    });

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: { moderateurs: { select: { id: true } } }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    const isAdmin = user.role === "ADMIN";
    const isModerator = community.moderateurs.some(m => m.id === userId);

    if (!isAdmin && !isModerator) {
        const err = new Error("Vous n'avez pas les droits nécessaires pour supprimer cette communauté.");
        err.status = 403;
        throw err;
    }

    const logoUrl = community.logo;
    if (logoUrl) {
        const publicId = logoUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } else {
        const err = new Error("Logo non trouvé");
        err.status = 404;
        throw err;
    }

    await prisma.community.delete({
        where: { id: parseInt(communityId) }
    });

    return { message: "Communauté supprimée avec succès.",
        communityId: communityId
    };
}

const modifyCommunityService = async (req) => {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { nom, description } = req.body;
    const logo = req.file;

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: { moderateurs: { select: { id: true } } }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    // Vérification des droits
    const user = await prisma.utilisateur.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    const isAdmin = user.role === "ADMIN";
    const isModerator = community.moderateurs.some(m => m.id === userId);
    if (!isAdmin && !isModerator) {
        const err = new Error("Vous n'avez pas les droits nécessaires pour modifier cette communauté.");
        err.status = 403;
        throw err;
    }

    // Modif des champs rentrées dans la requête
    const data = {};
    if (nom !== undefined) data.nom = nom;
    if (description !== undefined) data.description = description;

    if (logo) {
        //suppression de l'ancien logo si présent
        if (community.logo) {
            const publicId = community.logo.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }
        // Upload du nouveau logo
        const uploadResult = await cloudinary.uploader.upload(logo.path, {
            folder: 'logoCommunities',
            resource_type: 'image'
        });
        data.logo = uploadResult.secure_url;
    }

    const updatedCommunity = await prisma.community.update({
        where: { id: parseInt(communityId) },
        data
    });

    return updatedCommunity;
};

const joinCommunityService = async (req) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    // Vérification de l'existence de la communauté
    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: { membres: { select: { id: true } } }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }
    const isMember = community.membres.some(m => m.id === userId);
    if (isMember) {
        const err = new Error("Vous êtes déjà membre de cette communauté.");
        err.status = 409;
        throw err;
    }

    // Ajout de l'utilisateur à la communauté
    await prisma.community.update({
        where: { id: parseInt(communityId) },
        data: {
            membres: {
                connect: { id: userId }
            }
        }
    });

    return { success: true, message: "Rejoint avec succès", communityId: community.id };


}


const leaveCommunityService = async (req) => {
    const { communityId } = req.params;
    const userId = req.user.id;

    // Vérification de l'existence de la communauté
    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: { membres: { select: { id: true } } }

    });
    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    // Vérification que l'utilisateur est membre
    const isMember = community.membres.some(m => m.id === userId);
    if (!isMember) {
        const err = new Error("Vous n'êtes pas membre de cette communauté.");
        err.status = 403;
        throw err;
    }

    // Suppression de l'utilisateur de la communauté
    await prisma.community.update({
        where: { id: parseInt(communityId) },
        data: {
            membres: {
                disconnect: { id: userId }
            }
        }
    });

    return { success: true, message: "Vous avez quitté la communauté avec succès", communityId: community.id };
}



export {
    createCommunityService,
    getCommunityByIdService,
    getCommunityByNameService,
    getCommunitiesService,
    deleteCommunityService,
    modifyCommunityService,
    joinCommunityService,
    leaveCommunityService
};