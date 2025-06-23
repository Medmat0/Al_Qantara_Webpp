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

    // Vérifie si le membre est dans la communauté
    const member = community.membres.find(member => member.id === parseInt(memberId));
    if (!member) {
        throw {status: 404, message: "Membre non trouvé dans la communauté."};
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

export {
    promoteMemberService,
    banMemberService
};