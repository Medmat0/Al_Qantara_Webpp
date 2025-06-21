import {PrismaClient} from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

const isMember = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const communityId = parseInt(req.params.communityId);
    console.log("User ID:", userId);

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

export { isMember };