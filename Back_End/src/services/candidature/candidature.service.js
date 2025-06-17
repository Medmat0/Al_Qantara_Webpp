import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();

const getCandidatureScore = async (offreRef, experiences, skills, motivation) => {
    const response = await fetch(process.env.WEB_SERVICE_URL + "/cv_score", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offreEmploi: {
                offreEmploiId: offreRef.id,
                ...offreRef
            },
            experiences: experiences ? JSON.parse(experiences) : [],
            skills: skills ? JSON.parse(skills) : [],
            motivation: motivation || ""        })
    });

    const responseBody = await response.text();
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du score: ${response.status} - ${responseBody}`);
    }

    const { score } = JSON.parse(responseBody);
    console.log("Score de la candidature:", score);
    return Number(score);
};

const addCandidatureService = async (req) => {
    const { id } = req.params;
    const candidatCV = req.file;
    const { experiences, skills, lettreMotivation } = req.body;

    if (!candidatCV) {
        throw new Error("Veuillez ajouter un CV.");
    }

    const offre = await prisma.offre.findUnique({
        where: { id: parseInt(id) },
    });

    if (!offre) {
        throw new Error("Offre non trouvée.");
    }

    const existingCandidature = await prisma.candidature.findFirst({
        where: {
            offreId: parseInt(id),
            utilisateurId: req.user.id,
        },
    });

    if (existingCandidature) {
        throw new Error("Vous avez déjà postulé à cette offre.");
    }

    const offreRef = await prisma.offre.findUnique({
        where: { id: parseInt(id) },
        select: {
            id: true,
            titre: true,
            description: true,
            tags: true,
            lieuDeTravail: true,
            typeDeContrat: true,
            dateDebut: true,
            datePublication: true
        }
    });

    const candidatureScore = await getCandidatureScore(
        offreRef,
        experiences,
        skills,
        lettreMotivation
    );

    const uploadResult = await cloudinary.uploader.upload(candidatCV.path, {
        resource_type: "auto",
        folder: "candidatures",
        format: "pdf",
        access_mode: "authenticated"
    });

    if (!uploadResult || !uploadResult.secure_url) {
        throw new Error("Erreur lors du téléchargement du fichier.");
    }

    const newCandidature = await prisma.candidature.create({
        data: {
            offreId: parseInt(id),
            utilisateurId: req.user.id,
            lettreMotivation:lettreMotivation,
            cv: uploadResult.secure_url,
            skills: Array.isArray(skills) ? skills : skills ? JSON.parse(skills) : [],
            experiences: Array.isArray(experiences) ? experiences : experiences ? JSON.parse(experiences) : [],
            score: candidatureScore,
        },
        include: {
            offre: true,
            utilisateur: true,
        }
    });

    const candidatureWithoutPrivateInfo = { ...newCandidature };
    delete candidatureWithoutPrivateInfo.cv;
    delete candidatureWithoutPrivateInfo.score;

    return {
        message: "Candidature envoyée avec succès.",
        candidature: candidatureWithoutPrivateInfo
    };
};

const deleteCandidatureService = async (req) => {
    const { candidatureId } = req.params;
    const userId = req.user?.id;

    const candidature = await prisma.candidature.findUnique({
        where: { id: parseInt(candidatureId) },
        include: { utilisateur: true }
    });

    if (!candidature) {
        throw new Error("Candidature non trouvée.");
    }

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user || (user.role !== "ADMIN" && candidature.utilisateurId !== userId)) {
        throw new Error("Accès refusé.");
    }

    const fileUrl = candidature.cv;
    if (fileUrl) {
        const publicId = fileUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } else {
        throw new Error("Aucun fichier associé à cette candidature.");
    }

    await prisma.candidature.delete({
        where: { id: parseInt(candidatureId) },
    });

    return { message: "Candidature supprimée avec succès." };
};

const getCandidatureByIdService = async (req) => {
    const { candidatureId } = req.params;
    const userId = req.user?.id;

    const candidature = await prisma.candidature.findUnique({
        where: { id: parseInt(candidatureId) },
        include: { utilisateur: true }
    });

    if (!candidature) {
        throw new Error("Candidature non trouvée.");
    }

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user || (user.role !== "ADMIN" && candidature.utilisateurId !== userId)) {
        throw new Error("Accès refusé.");
    }

    return candidature;
};

const getAllCandidaturesByUserIdService = async (req) => {
    const userId = req.user?.id;

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("Accès refusé.");
    }

    const candidatures = await prisma.candidature.findMany({
        where: { utilisateurId: userId },
        include: { offre: true }
    });

    if (!candidatures || candidatures.length === 0) {
        throw new Error("Aucune candidature trouvée pour cet utilisateur.");
    }

    if (user.role !== "ADMIN") {
        const isOwner = candidatures.some(c => c.utilisateurId === userId);
        if (!isOwner) {
            throw new Error("Accès refusé.");
        }
    }

    return candidatures;
};

const getAllCandidaturesByOfferIdService = async (req) => {
    const { id } = req.params;

    const candidatures = await prisma.candidature.findMany({
        where: { offreId: parseInt(id) },
        include: { utilisateur: true }
    });

    if (!candidatures || candidatures.length === 0) {
        throw new Error("Aucune candidature trouvée pour cette offre.");
    }

    return candidatures;
};

export {addCandidatureService, deleteCandidatureService, getAllCandidaturesByOfferIdService, getAllCandidaturesByUserIdService, getCandidatureByIdService};
