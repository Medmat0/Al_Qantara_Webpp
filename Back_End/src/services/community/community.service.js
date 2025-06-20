import {PrismaClient} from '@prisma/client';
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();


const createCommunityService = async(req) => {

    const { nom, description } = req.body;
    const logo = req.file;
    const userId = req.user.id;

    console.log("Fichier reçu pour le logo :", logo);

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (user.role !== "ADMIN" && user.role !== "ADHERENT") {
        const err = new Error("Vous n'avez pas les droits nécessaires pour créer une communauté.");
        err.status = 403;
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


    const newCommunity = await prisma.community.create({
        data: {
            nom,
            description,
            logo: imageUrl,
            createdBy: userId
        }
    });

    return newCommunity;
}

const getCommunityByIdService = async (req) => {
    const { communityId } = req.params;

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
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
            orderBy: { dateCreation: 'desc' }
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

    return { message: "Communauté supprimée avec succès." };
}

export { createCommunityService, getCommunityByIdService, getCommunitiesService, deleteCommunityService };