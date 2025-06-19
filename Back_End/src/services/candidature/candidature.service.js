import { PrismaClient , StatutCandidature } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";
import {sendEmailToUser} from "../../utils/email.config.js";
import {createZoomMeeting} from "../zoom.service.js";

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


const checkCandidatureService = async (req) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new Error("Utilisateur non authentifié.");

    const existingCandidature = await prisma.candidature.findFirst({
        where: {
            offreId: parseInt(id),
            utilisateurId: userId,
        },
    });

    return !!existingCandidature;
};

const formatDateForGoogle = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return (
        date.getUTCFullYear().toString() +
        pad(date.getUTCMonth() + 1) +
        pad(date.getUTCDate()) +
        'T' +
        pad(date.getUTCHours()) +
        pad(date.getUTCMinutes()) +
        '00Z'
    );
};


const acceptCandidatureService = async (req) => {
    const candidatureId = req.params.candidatureId;
    const userId = req.user?.id;

    const candidature = await prisma.candidature.findUnique({
        where: { id: parseInt(candidatureId) },
        include: {
            utilisateur: true,
            offre: true,
        },
    });

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId },
    });



    if (!candidature) {
        throw new Error("Candidature non trouvée.");
    }

    const candidateEmail = candidature.utilisateur.email;
    const candidateName = candidature.utilisateur.nom + " " + candidature.utilisateur.prenom;

    const adminEmail = user.email;

    const startTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const zoomMeeting = await createZoomMeeting(candidateEmail, startTime.toISOString());

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Entretien%20avec%20notre%20équipe&dates=${formatDateForGoogle(startTime)}/${formatDateForGoogle(endTime)}&details=Voici%20le%20lien%20Zoom%20:%20${encodeURIComponent(zoomMeeting.join_url)}&location=${encodeURIComponent(zoomMeeting.join_url)}`;

    await sendEmailToUser({
        to: candidateEmail,
        subject: `Entretien avec notre équipe`,
        html: `
      <h2>Bonjour ${candidateName},</h2>
      <p>Votre entretien est prévu le <strong>${startTime.toLocaleString('fr-FR')}</strong>.</p>
      <p>Voici le lien Zoom pour rejoindre l'appel :<br>
      <a href="${zoomMeeting.join_url}">${zoomMeeting.join_url}</a></p>
      <p><a href="${googleCalendarUrl}" target="_blank">Ajouter à Google Agenda</a></p>
      <p>Un email Zoom vous a été automatiquement envoyé également.</p>
    `,
    });

    await sendEmailToUser({
        to: adminEmail,
        subject: `Réunion Zoom planifiée avec ${candidateName}`,
        html: `
      <h2>Réunion planifiée</h2>
      <p>Une réunion Zoom a été planifiée avec le candidat ${candidateName} pour l'offre: ${candidature.offre.titre}.</p>
      <p>Email du candidat : ${candidateEmail}</p>
      <p>Date : ${startTime.toLocaleString('fr-FR')}</p>
      <p><a href="${googleCalendarUrl}" target="_blank">Ajouter à Google Agenda</a></p>
      <p>Lien Zoom (admin) : <a href="${zoomMeeting.start_url}">${zoomMeeting.start_url}</a></p>
    `,
    });


    return {message: "Candidature acceptée et email envoyé au candidat."};
}



export {
    addCandidatureService,
    deleteCandidatureService,
    getAllCandidaturesByOfferIdService,
    getAllCandidaturesByUserIdService,
    getCandidatureByIdService,
    checkCandidatureService,
    acceptCandidatureService,
};
