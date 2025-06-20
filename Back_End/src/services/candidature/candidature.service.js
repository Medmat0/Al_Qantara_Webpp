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
        const err = new Error("Veuillez ajouter un CV.");
        err.status = 400;
        throw err;
    }

    const offre = await prisma.offre.findUnique({
        where: { id: parseInt(id) },
    });

    if (!offre) {
        const err = new Error("Offre non trouvée.");
        err.status = 404;
        throw err;
    }

    const existingCandidature = await prisma.candidature.findFirst({
        where: {
            offreId: parseInt(id),
            utilisateurId: req.user.id,
        },
    });

    if (existingCandidature) {
        const err = new Error("Vous avez déjà postulé à cette offre.");
        err.status = 409;
        throw err;
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
        const err = new Error("Erreur lors du téléchargement du fichier.");
        err.status = 500;
        throw err;
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
        const err = new Error("Candidature non trouvée.");
        err.status = 404;
        throw err;
    }

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user || (user.role !== "ADMIN" && candidature.utilisateurId !== userId)) {
        const err = new Error("Accès refusé.");
        err.status = 403;
        throw err;
    }

    const fileUrl = candidature.cv;
    if (fileUrl) {
        const publicId = fileUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } else {
        const err = new Error("Fichier de candidature non trouvé.");
        err.status = 404;
        throw err;
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
        const err = new Error("Candidature non trouvée.");
        err.status = 404;
        throw err;
    }

    const offre = await prisma.offre.findUnique({
        where: { id: candidature.offreId }
    });

    if (!offre) {
        const err = new Error("Offre non trouvée.");
        err.status = 404;
        throw err;
    }

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user || (user.role !== "ADMIN" && candidature.utilisateurId !== userId)) {
        const err = new Error("Accès refusé.");
        err.status = 403;
        throw err;
    }

    return candidature;
};

const getAllCandidaturesByUserIdService = async (req) => {
    const userId = req.user?.id;

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user) {
        const err = new Error("Utilisateur non trouvée.");
        err.status = 404;
        throw err;
    }

    const candidatures = await prisma.candidature.findMany({
        where: { utilisateurId: userId },
        include: { offre: true }
    });

    if (!candidatures || candidatures.length === 0) {
        const err = new Error("Aucune candidature trouvée pour cet utilisateur.");
        err.status = 404;
        throw err;
    }

    if (user.role !== "ADMIN") {
        const isOwner = candidatures.some(c => c.utilisateurId === userId);
        if (!isOwner) {
            const err = new Error("Accès refusé");
            err.status = 403;
            throw err;
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
        const err = new Error("Aucune candidatures trouvées pour cette offre.");
        err.status = 404;
        throw err;
    }

    return candidatures;
};


const checkCandidatureService = async (req) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        const err = new Error("Utilisateur non authentifié.");
        err.status = 401;
        throw err;
    }

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

    const { dateEntretien } = req.body;
    const startTime = new Date(dateEntretien);
    const endTime = new Date(startTime.getTime() + 40 * 60 * 1000);


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
        const err = new Error("Candidature non trouvée.");
        err.status = 404;
        throw err;

    }

    const candidateEmail = candidature.utilisateur.email;
    const candidateName = candidature.utilisateur.nom + " " + candidature.utilisateur.prenom;

    const adminEmail = user.email;

   const zoomMeeting = await createZoomMeeting(candidateEmail, startTime.toISOString());

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Entretien%20avec%20AlQantara&dates=${formatDateForGoogle(startTime)}/${formatDateForGoogle(endTime)}&details=Voici%20le%20lien%20Zoom%20:%20${encodeURIComponent(zoomMeeting.join_url)}&location=${encodeURIComponent(zoomMeeting.join_url)}`;


    await sendEmailToUser({
        to: candidateEmail,
        subject: `Entretien avec AlQantara`,
        html: `
      <h2>Bonjour ${candidateName},</h2>
      <p>Votre entretien  pour le poste de ${candidature.offre.titre} est prévu le <strong>${startTime.toLocaleString('fr-FR', { timeZone: 'UTC' })}</strong>.</p>
      <p>Voici le lien Zoom pour rejoindre l'appel :<br>
      <p><a href="${zoomMeeting.join_url}">${zoomMeeting.join_url}</a></p>
      <p><a href="${googleCalendarUrl}" target="_blank">Ajouter à Google Agenda</a></p>
    `,
    });

    await sendEmailToUser({
        to: adminEmail,
        subject: `Réunion Zoom planifiée avec ${candidateName}`,
        html: `
      <h2>Réunion planifiée</h2>
      <p>Une réunion Zoom a été planifiée avec le candidat ${candidateName} pour l'offre: ${candidature.offre.titre}.</p>
      <p>Email du candidat : ${candidateEmail}</p>
      <p>Date : ${startTime.toLocaleString('fr-FR', { timeZone: 'UTC' })}</p>
      <p><a href="${googleCalendarUrl}" target="_blank">Ajouter à Google Agenda</a></p>
      <p>Lien Zoom admin (réservé pour une personne) : </p>
      <p><a href="${zoomMeeting.start_url}">${zoomMeeting.start_url}</a></p>
      <p>Lien Zoom à partager (pour d'autres membres d'AlQantara) : </p>
      <p><a href="${zoomMeeting.join_url}">${zoomMeeting.join_url}</a></p>
    `,
    });

    await prisma.candidature.update({
        where: { id: parseInt(candidatureId) },
        data: {
            statut: StatutCandidature.ACCEPTEE,
        },
    });


    return {message: "Candidature acceptée et email envoyé au candidat."};
}


const refuseCandidatureService = async (req) => {
    const candidatureId = req.params.candidatureId;

    const candidature = await prisma.candidature.findUnique({
        where: { id: parseInt(candidatureId) },
        include: {
            utilisateur: true,
            offre: true,
        },

    });

    if (!candidature) {
        const err = new Error("Candidature non trouvée.");
        err.status = 404;
        throw err;
    }

    const refusedUserId = candidature.utilisateurId;
    const refusedUser = await prisma.utilisateur.findUnique({
        where: { id: refusedUserId },
    });

    if (!refusedUser) {
        const err = new Error("Utilisateur non trouvé.");
        err.status = 404;
        throw err;
    }

    const refusedEmail = refusedUser.email;
    const refusedName = refusedUser.nom + " " + refusedUser.prenom;

    await sendEmailToUser({
        to: refusedEmail,
        subject: `Candidature refusée pour le poste de ${candidature.offre.titre}`,
        html: `
            <h2>Bonjour ${refusedName},</h2>
            <p>Nous vous remercions pour votre candidature au poste de ${candidature.offre.titre}.</p>
            <p>Après examen, nous avons le regret de vous informer que nous ne pouvons pas retenir votre candidature pour ce poste.</p>
            <p>Nous vous souhaitons bonne chance dans vos recherches futures.</p>
            
            <p>Cordialement,</p>
            <p>L'équipe AlQantara</p>
                
        `,
    });

    await prisma.candidature.update({
        where: { id: parseInt(candidatureId) },
        data: {
            statut: StatutCandidature.REJETEE,
        },
    });

    return { message: "Candidature refusée et email envoyé au candidat." };


}


export {
    addCandidatureService,
    deleteCandidatureService,
    getAllCandidaturesByOfferIdService,
    getAllCandidaturesByUserIdService,
    getCandidatureByIdService,
    checkCandidatureService,
    acceptCandidatureService,
    refuseCandidatureService
};
