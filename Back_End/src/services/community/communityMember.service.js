import {PrismaClient} from '@prisma/client';
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();

const promoteMemberService = async (req) => {
    const {communityId, memberId} = req.params;

    // Vérifie si la communauté existe
    const community = await prisma.community.findUnique({
        where: {id: parseInt(communityId)},
        include: {
            members: true,
        },
    });

    if (!community) {
        throw {status: 404, message: "Communauté non trouvée."};
    }

    // Check if the user is a member of the community
    const member = community.membres.find(member => member.id === memberId);
    if (!member) {
        throw {status: 404, message: "Membre non trouvé dans la communauté."};
    }

    // Promotion du membre en moderateur
    const updatedCommunity = await prisma.community.update({
        where: { id: parseInt(communityId) },
        data: {
            moderateurs: {
                connect: { id: parseInt(memberId) }
            }
        },
    });

    return {
        message: `Membre ajouté en tant que modérateur avec succès.`,
        memberId: memberId,
    };

}

const banMemberService = async (req) => {
    const {communityId, memberId} = req.params;
    console.log("Bannissement du membre:", memberId, "de la communauté:", communityId);

    // Vérifie si la communauté existe
    const community = await prisma.community.findUnique({
        where: {id: parseInt(communityId)},
        include: {
            membres: true,
        },
    });

    if (!community) {
        throw {status: 404, message: "Communauté non trouvée."};
    }

    const member = community.membres.find(member => member.id === parseInt(memberId));
    if (!member) {
        throw {status: 404, message: "Membre non trouvé dans la communauté."};
    }

    if (member.id === req.userId) {
        throw {status: 403, message: "Vous ne pouvez pas vous bannir vous-même."};
    }

    const isBanned = community.membresbannis.some(bannedMember => bannedMember.id === parseInt(memberId));
    if (isBanned) {
        throw {status: 400, message: "Le membre est déjà banni de la communauté."};
    }

    // Bannissement du membre
    const updatedCommunity = await prisma.community.update({
        where: { id: parseInt(communityId) },
        data: {
            membres: {
                disconnect: { id: parseInt(memberId) }
            },
            membresbannis: {
                connect: { id: parseInt(memberId) }
            }
        },
    });

    return {
        message: `Membre banni de la communauté avec succès.`,
        memberId: memberId,
    };
}

const getCommunityModeratorsService = async (req) => {
    const { communityId } = req.params;
    const userCommunityRole = req.userCommunityRole;
    if (userCommunityRole !== "ADMIN" && userCommunityRole !== "MODERATEUR") {
        const err = new Error("Vous n'avez pas les droits nécessaires.");
        err.status = 403;
        throw err;
    }

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: { moderateurs: true }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }
    return community.moderateurs;
}

const getCommunityMembersService = async (req) => {
    const { communityId } = req.params;
    const userCommunityRole = req.userCommunityRole;
    if (userCommunityRole !== "ADMIN" && userCommunityRole !== "MODERATEUR") {
        const err = new Error("Vous n'avez pas les droits nécessaires.");
        err.status = 403;
        throw err;
    }

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: {
            membres: {
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    photoProfil: true,
                    role: true,
                }
            }
        }
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    return community.membres;
}

const demoteModeratorService = async (req) => {
    const { communityId, moderatorId } = req.params;
    const userCommunityRole = req.userCommunityRole;
    if (userCommunityRole !== "ADMIN" && userCommunityRole !== "MODERATEUR") {
        const err = new Error("Vous n'avez pas les droits nécessaires.");
        err.status = 403;
        throw err;
    }

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: {
            moderateurs: true,
        },
    });

    if (!community) {
        throw { status: 404, message: "Communauté non trouvée." };
    }


    const moderator = community.moderateurs.find(mod => mod.id === parseInt(moderatorId));
    if (!moderator) {
        throw { status: 404, message: "Modérateur non trouvé dans la communauté." };
    }
    if( moderator.id === req.userId) {
        throw { status: 403, message: "Vous ne pouvez pas vous rétrograder en tant que modérateur." };
    }

    const updatedCommunity = await prisma.community.update({
        where: { id: parseInt(communityId) },
        data: {
            moderateurs: {
                disconnect: { id: parseInt(moderatorId) }
            }
        },
    });

    return {
        message: `Modérateur rétrogradé avec succès.`,
        moderatorId: moderatorId,
    };

}

const unbanMemberService = async (req) => {
    const { communityId, memberId } = req.params;
    const userCommunityRole = req.userCommunityRole;
    if (userCommunityRole !== "ADMIN" && userCommunityRole !== "MODERATEUR") {
        const err = new Error("Vous n'avez pas les droits nécessaires.");
        err.status = 403;
        throw err;
    }

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: {
            membresbannis: true,
        },
    });

    if (!community) {
        throw { status: 404, message: "Communauté non trouvée." };
    }

    const bannedMember = community.membresbannis.find(member => member.id === parseInt(memberId));
    if (!bannedMember) {
        throw { status: 404, message: "Membre banni non trouvé dans la communauté." };
    }
    const updatedCommunity = await prisma.community.update({
        where: { id: parseInt(communityId) },
        data: {
            membresbannis: {
                disconnect: { id: parseInt(memberId) }
            },
            membres: {
                connect: { id: parseInt(memberId) }
            }
        },
    });
    return {
        message: `Membre débanni de la communauté avec succès.`,
        memberId: memberId,
    };
}

const getCommunityBanishedService = async (req) => {

    const { communityId } = req.params;
    const userCommunityRole = req.userCommunityRole;
    if (userCommunityRole !== "ADMIN" && userCommunityRole !== "MODERATEUR") {
        const err = new Error("Vous n'avez pas les droits nécessaires.");
        err.status = 403;
        throw err;
    }

    const community = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
    });

    if (!community) {
        const err = new Error("Communauté non trouvée.");
        err.status = 404;
        throw err;
    }

    const banishedMembers = await prisma.community.findUnique({
        where: { id: parseInt(communityId) },
        include: { membresbannis: true }
    });

    return banishedMembers.membresbannis;
 }

export {
    promoteMemberService,
    banMemberService,
    getCommunityMembersService,
    demoteModeratorService,
    unbanMemberService,
    getCommunityModeratorsService,
    getCommunityBanishedService
};