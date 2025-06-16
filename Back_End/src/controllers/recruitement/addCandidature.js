import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter une candidature à une offre de recrutement
 * @method  POST
 * @route   /:id/apply
 */

const addCandidature = async (req, res) => {
    const { id } = req.params; // ID de l'offre
    const candidatCV = req.file;
    const { experiences,skills, motivation } = req.body; // Champs du formulaire


    if (!candidatCV) {
        return res.status(400).json({ message: "Veuillez ajouter un CV." });
    }

    try {

        // Vérifier si l'offre existe
        const offre = await prisma.offre.findUnique({
            where: { id: parseInt(id) },
        });

        if (!offre) {
            return res.status(404).json({ message: "Offre non trouvée." });
        }

        // Vérifier si une candidature existe déjà pour cet utilisateur et cette offre
        const existingCandidature = await prisma.candidature.findFirst({
            where: {
                offreId: parseInt(id),
                utilisateurId: req.user.id,
            },
        });
        if (existingCandidature) {
            return res.status(409).json({ message: "Vous avez déjà postulé à cette offre." });
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

        const candidatureForScoring = {
            offreRef,
            experiences,
            skills,
            motivation
        };
        const candidatureScore = await getCandidatureScore(
            candidatureForScoring.offreRef,
            candidatureForScoring.experiences,
            candidatureForScoring.skills,
            candidatureForScoring.motivation
        );
        console.log("Candidature Score:", candidatureScore);



        const uploadResult = await cloudinary.uploader.upload(candidatCV.path,{
            resource_type:"auto",
            folder:"candidatures",
            format:"pdf",
            access_mode:"authenticated"
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error("Erreur lors du téléchargement du fichier.");
        }

        const newCandidature = await prisma.candidature.create({
            data: {
                offreId: parseInt(id),
                utilisateurId: req.user.id,
                lettreMotivation: motivation,
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
        return res.status(200).json({
            message: "Candidature envoyée avec succès.",
            candidature: candidatureWithoutPrivateInfo
        });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de la candidature.",
            error: error.message,
        });
    }
}

const getCandidatureScore = async (offreRef, experiences,skills,motivation) => {
    const response = await fetch(process.env.WEB_SERVICE_URL+"/cv_score", {
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
            motivation: motivation ? JSON.parse(motivation) : ""
        })
    });
    const responseBody = await response.text();
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du score: ${response.status} - ${responseBody}`);
    }
    const { score } = JSON.parse(responseBody);
    console.log("Score de la candidature:", score);
    return Number(score);
}




export{addCandidature};