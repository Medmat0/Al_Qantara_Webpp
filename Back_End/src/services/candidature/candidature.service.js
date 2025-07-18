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
        const err = new Error("Candidature non trouvée ou accès refusé.");
        err.status = 404;
        throw err;
    }

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user || (user.role !== "ADMIN" && candidature.utilisateurId !== userId)) {
        const err = new Error("Candidature non trouvée ou accès refusé.");
        err.status = 404;
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
    const offreId = req.params.id;
    const userId = req.user?.id;

    const candidature = await prisma.candidature.findUnique({
        where: { id: parseInt(candidatureId) },
        include: { utilisateur: true }
    });

    if (!candidature) {
        const err = new Error("Candidature non trouvée ou accès refusé.");
        err.status = 404;
        throw err;
    }

    const offre = await prisma.offre.findUnique({
        where: { id: parseInt(offreId) },
    });
    if (!offre) {
        const err = new Error("Offre non trouvée ou accès refusé.");
        err.status = 404;
        throw err;
    }

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId }
    });

    if (!user || (user.role !== "ADMIN" && candidature.utilisateurId !== userId)) {
        const err = new Error("Candidature non trouvée ou accès refusé.");
        err.status = 404;
        throw err;
    }

    return candidature;
};

const getAllCandidaturesByUserIdService = async (req) => {
    const userId = req.params.userId;
    const userRequesting = req.user?.id;

    const user = await prisma.utilisateur.findUnique({
        where: { id: parseInt(userId) }
    });

    const requestingUser = await prisma.utilisateur.findUnique({
        where: { id: parseInt(userRequesting) }
    });

    if (!user) {
        const err = new Error("Utilisateur non trouvée ou accès refusé.");
        err.status = 404;
        throw err;
    }

    const candidatures = await prisma.candidature.findMany({
        where: { utilisateurId: parseInt(userId) },
        include: { offre: true }
    });

    if (!candidatures || candidatures.length === 0) {
        const err = new Error("Aucune candidature trouvée pour cet utilisateur ou accès refusé.");
        err.status = 404;
        throw err;
    }

    if (requestingUser.role !== "ADMIN") {
        const isOwner = candidatures.some(c => c.utilisateurId === userId);
        if (!isOwner) {
            const err = new Error("Candidature non trouvée ou accès refusé.");
            err.status = 404;
            throw err;
        }
    }



    return candidatures;
};

const getAllCandidaturesByOfferIdService = async (req) => {
    const { id } = req.params;

    const offre = await prisma.offre.findUnique({
        where: { id: parseInt(id) },

    });
    if (!offre) {
        const err = new Error("Offre non trouvée.");
        err.status = 404;
        throw err;
    }

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


const sendZoomReunionService = async (req) => {
    const candidatureId = req.params.candidatureId;
    const userId = req.user?.id;
    const offreId = req.params.id;

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


    if (!candidature) {
        const err = new Error("Candidature non trouvée.");
        err.status = 404;
        throw err;

    }

    const offre = await prisma.offre.findUnique({
        where: { id: parseInt(offreId) },
    });

    if (!offre) {
        const err = new Error("Offre non trouvée.");
        err.status = 404;
        throw err;
    }

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId },
    });

    const candidateEmail = candidature.utilisateur.email;
    const candidateName = candidature.utilisateur.nom + " " + candidature.utilisateur.prenom;

    const adminEmail = user.email;

   const zoomMeeting = await createZoomMeeting(candidateEmail, startTime.toISOString());

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Entretien%20avec%20AlQantara&dates=${formatDateForGoogle(startTime)}/${formatDateForGoogle(endTime)}&details=Voici%20le%20lien%20Zoom%20:%20${encodeURIComponent(zoomMeeting.join_url)}&location=${encodeURIComponent(zoomMeeting.join_url)}`;


    await sendEmailToUser({
        to: candidateEmail,
        subject: `Entretien avec AlQantara`,
        html: getNewsletterEmailTemplate({
          title: `Convocation à un entretien Zoom`,
          subtitle: `Bonjour ${candidateName},`,
          content: `
            <p>Votre entretien pour le poste de <strong>${candidature.offre.titre}</strong> est prévu le <strong>${startTime.toLocaleString('fr-FR', { timeZone: 'UTC' })}</strong>.</p>
            <p>Voici le lien Zoom pour rejoindre l'appel :<br>
            <a href="${zoomMeeting.join_url}">${zoomMeeting.join_url}</a></p>
            <p><a href="${googleCalendarUrl}" target="_blank">Ajouter à Google Agenda</a></p>
            <p>Cordialement,<br>L'équipe Al Qantara</p>
          `,
          unsubscribeLink: `${process.env.FRONT_URL}/newsletter/desinscription`
        }),
    });

    await sendEmailToUser({
        to: adminEmail,
        subject: `Réunion Zoom planifiée avec ${candidateName}`,
        html: getNewsletterEmailTemplate({
          title: `Réunion Zoom planifiée`,
          subtitle: `Bonjour ${user.nom},`,
          content: `
            <p>Une réunion Zoom a été planifiée avec le candidat <strong>${candidateName}</strong> pour l'offre : <strong>${candidature.offre.titre}</strong>.</p>
            <p>Email du candidat : <b>${candidateEmail}</b></p>
            <p>Date : <b>${startTime.toLocaleString('fr-FR', { timeZone: 'UTC' })}</b></p>
            <p><a href="${googleCalendarUrl}" target="_blank">Ajouter à Google Agenda</a></p>
            <p>Lien Zoom admin (réservé pour une personne) :<br>
              <a href="${zoomMeeting.start_url}">${zoomMeeting.start_url}</a>
            </p>
            <p>Lien Zoom à partager (pour d'autres membres d'AlQantara) :<br>
              <a href="${zoomMeeting.join_url}">${zoomMeeting.join_url}</a>
            </p>
            <p>Cordialement,<br>L'équipe Al Qantara</p>
          `,
          unsubscribeLink: `${process.env.FRONT_URL}/newsletter/desinscription`
        }),
    });


    return {message: "Email de réunion envoyé au candidat."};
}

const acceptCandidatureService = async (req) => {
    const candidatureId = req.params.candidatureId;
    const offreId = req.params.id;

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

    if( candidature.statut === StatutCandidature.ACCEPTEE) {
        const err = new Error("Cette candidature a déjà été acceptée.");
        err.status = 400;
        throw err;
    }

    const offre = await prisma.offre.findUnique({
        where: { id: parseInt(offreId) },
    });

    if (!offre) {
        const err = new Error("Offre non trouvée.");
        err.status = 404;
        throw err;
    }

    const acceptedUserId = candidature.utilisateurId;
    const acceptedUser = await prisma.utilisateur.findUnique({
        where: { id: acceptedUserId },
    });

    if (!acceptedUser) {
        const err = new Error("Utilisateur non trouvé.");
        err.status = 404;
        throw err;
    }

    const acceptedEmail = acceptedUser.email;
    const acceptedName = acceptedUser.nom + " " + acceptedUser.prenom;

    await sendEmailToUser({
        to: acceptedEmail,
        subject: `Candidature acceptée pour le poste de ${candidature.offre.titre}`,
        html: getNewsletterEmailTemplate({
          title: `Candidature acceptée !`,
          subtitle: `Bonjour ${acceptedName},`,
          content: `
            <p>Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>${candidature.offre.titre}</strong> a été acceptée.</p>
            <p>Nous vous contacterons prochainement pour les démarches qui vont suivre.</p>
            <p>Cordialement,<br>L'équipe Al Qantara</p>
          `,
          unsubscribeLink: `${process.env.FRONT_URL}/newsletter/desinscription` // ou lien spécifique si besoin
        }),
    });

    // Accepter la candidature sélectionnée
    await prisma.candidature.update({
        where: { id: parseInt(candidatureId) },
        data: {
            statut: StatutCandidature.ACCEPTEE,
        },
    });

    return { message: "Candidature acceptée et email envoyé au candidat." };
}


const refuseCandidatureService = async (req) => {
    const candidatureId = req.params.candidatureId;
    const offreId = req.params.id;

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

    const offre = await prisma.offre.findUnique({
        where: { id: parseInt(offreId) },
    });

    if (!offre) {
        const err = new Error("Offre non trouvée.");
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
        html: getNewsletterEmailTemplate({
          title: `Candidature refusée`,
          subtitle: `Bonjour ${refusedName},`,
          content: `
            <p>Nous vous remercions pour votre candidature au poste de <strong>${candidature.offre.titre}</strong>.</p>
            <p>Après examen, nous avons le regret de vous informer que nous ne pouvons pas retenir votre candidature pour ce poste.</p>
            <p>Nous vous souhaitons bonne chance dans vos recherches futures.</p>
            <p>Cordialement,<br>L'équipe Al Qantara</p>
          `,
          unsubscribeLink: `${process.env.FRONT_URL}/newsletter/desinscription`
        }),
    });

    await prisma.candidature.update({
        where: { id: parseInt(candidatureId) },
        data: {
            statut: StatutCandidature.REJETEE,
        },
    });

    return { message: "Candidature refusée et email envoyé au candidat." };


}

function getNewsletterEmailTemplate({ title, subtitle, content, unsubscribeLink }) {
  return `
    <div style="font-family: 'Cormorant Garamond', serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #9e2e2c 0%, #b8363f 100%); border-radius: 15px;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #9e2e2c; font-size: 2.2rem; margin: 0; font-weight: 700;">Al Qantara</h1>
          <p style="color: #666; font-size: 1.1rem; margin: 10px 0 0 0;">Association Culturelle</p>
        </div>
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2c3e50; font-size: 1.8rem; margin: 0;">${title}</h2>
          <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #9e2e2c, #b8363f); margin: 15px auto; border-radius: 2px;"></div>
        </div>
        <div style="margin: 30px 0;">
          ${subtitle ? `<p style='color: #555; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;'>${subtitle}</p>` : ''}
          ${content}
        </div>
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 0.85rem; margin: 0;">
            Vous recevez cet email suite à une action sur la plateforme Al Qantara.
          </p>
          ${unsubscribeLink ? `<p style="color: #999; font-size: 0.85rem; margin: 5px 0 0 0;"><a href="${unsubscribeLink}" style="color: #9e2e2c; text-decoration: none;">Se désabonner</a></p>` : ''}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #666; font-size: 0.8rem; margin: 0;">© 2024 Al Qantara. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  `;
}

export {
    addCandidatureService,
    deleteCandidatureService,
    getAllCandidaturesByOfferIdService,
    getAllCandidaturesByUserIdService,
    getCandidatureByIdService,
    checkCandidatureService,
    sendZoomReunionService,
    acceptCandidatureService,
    refuseCandidatureService
};
