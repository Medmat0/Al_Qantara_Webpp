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
    const {id}  = req.params; // ID de l'offre
    const cv  = req.file;
    const lettremotivation = req.body; // Détails de la candidature

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
        const cvBuffer = cv.buffer; // Récupérer le buffer du CV
        const candidatCvText = await parseCVToText(cvBuffer);
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
            candidatCvText
        }
        const candidatureScore = await getCandidatureScore(candidatureForScoring);

        return res.status(200).json({
            message: "Candidature analysée avec succès.",
            score: candidatureScore,
        });
        /*

        const uploadResult = await cloudinary.uploader.upload(cv,{
            resource_type:"auto",
            folder: "candidatures/cv",
            format: "pdf",
            access_mode: "private",
            }

        )

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error("Erreur lors du téléchargement du CV.");
        }

        // Créer la candidature
        const candidature = await prisma.candidature.create({
        data: {
            cv,
            lettreMotivation,
            offreId: parseInt(id),
            userId: req.user.id, // Utilisateur authentifié
        },
        });

        res.status(201).json({
        message: "Candidature ajoutée avec succès.",
        candidature,
        });

         */
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

const getCandidatureScore = async ({ offreRef, candidatCvText }) => {
    const response = await fetch('http://127.0.0.1:8000/cv_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offreEmploi: {
                offreEmploiId: offreRef.id,
                ...offreRef
            },
            candidatCV: candidatCvText
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