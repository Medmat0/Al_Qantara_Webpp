import {PrismaClient} from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

const isMember = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const communityId = parseInt(req.params.communityId);

    // Vérifie que la communauté existe et que l'utilisateur est membre
    const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: { membres: { select: { id: true } } }
    });

    if (!community) {
        return res.status(404).json({ message: "Communauté non trouvée." });
    }

    const isMember = community.membres.some(m => m.id === userId);
    if (!isMember) {
        return res.status(403).json({ message: "Vous n'êtes pas membre de cette communauté, requête impossible" });
    }

    next();
});

const userCommunityRole = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const communityId = parseInt(req.params.communityId);

    // Récupère la communauté avec ses membres et modérateurs
    const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
            membres: { select: { id: true } },
            moderateurs: { select: { id: true } }
        }
    });

    if (!community) {
        return res.status(404).json({ message: "Communauté non trouvée." });
    }

    if (req.user.role === "ADMIN") {
        req.userCommunityRole = "ADMIN";
    } else if (community.moderateurs.some(m => m.id === userId)) {
        req.userCommunityRole = "MODERATEUR";
    } else if (community.membres.some(m => m.id === userId)) {
        req.userCommunityRole = "MEMBER";
    } else {
        req.userCommunityRole = "NONE";
    }

    next();
});

const isBanished = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const communityId = parseInt(req.params.communityId);

    // Vérifie si l'utilisateur est banni de la communauté
    const isBanned = await prisma.community.findFirst({
        where: {
            id: communityId,
            membresbannis: {
                some: { id: userId }
            }
        }
    });

    if (isBanned) {
        return res.status(403).json({ message: "Vous êtes banni de cette communauté." });
    }

    next();
});

export { userCommunityRole, isMember , isBanished };
