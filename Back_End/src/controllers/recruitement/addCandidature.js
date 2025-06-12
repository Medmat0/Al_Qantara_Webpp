import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";
import {getOffreById} from "./getOffreById.js";
import pdf from "pdf-parse";
import tesseract from "tesseract.js";
const prisma = new PrismaClient();

/**
 * @desc    Ajouter une candidature à une offre de recrutement
 * @method  POST
 * @route   /:id/apply
 */

const addCandidature = async (req, res) => {
    const { id } = req.params; // ID de l'offre
    const cv = req.file;
    const { formText, lettreMotivation } = req.body; // Champs du formulaire

    if (!cv) {
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

        const completeCandidatureText = formText + '\n\n' + lettreMotivation;
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
            completeCandidatureText
        };
        const candidatureScore = await getCandidatureScore(candidatureForScoring.offreRef, candidatureForScoring.completeCandidatureText);

        /*

        const newCandidature = await prisma.candidature.create({
            data: {
                offreId: parseInt(id),
                utilisateurId: req.user.id, // Assurez-vous que l'ID utilisateur est disponible dans req.user
                lettreMotivation,
                cv: cv.path, // Stockez le chemin du CV si le champ existe dans le modèle
                score: candidatureScore,
            },
            include: {
                offre: true,
                utilisateur: true,
            }
        });

         */


        return res.status(200).json({
            message: "Candidature analysée avec succès.",
            score: candidatureScore,
            formText,
            lettreMotivation
        });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de l'ajout de la candidature.",
            error: error.message,
        });
    }
}

const parseCVToText = async (cvBuffer) => {
    const data = await pdf(cvBuffer);
    if (data.text.length < 20) {
        // Si le PDF est trop court, essayer avec Tesseract.js pour détecter le texte dans l'image
        const { data: { text } } = await tesseract.recognize(
            cvBuffer,
            'fra',
            {
                logger: info => console.log(info)
            }
        );
        data.text = text;

    }
    return data.text;
}

const getCandidatureScore = async (offreRef, candidatCvText) => {
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
            candidatureText: candidatCvText
        })
    });
    const responseBody = await response.text();
    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du score: ${response.status} - ${responseBody}`);
    }
    const { score } = JSON.parse(responseBody);
    return score;
}
export{addCandidature};