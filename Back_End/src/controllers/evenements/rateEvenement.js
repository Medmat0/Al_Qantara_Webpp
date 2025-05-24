import { PrismaClient } from "@prisma/client";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter une note à un événement
 * @method  POST
 * @route   /evenements/:id/rate
 */
const rateEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      noteOrganisateur,
      noteLieu,
      noteAmbiance,
      noteEvenement,
      commentaire
    } = req.body;
    const utilisateurId = req.user.id;

    // Vérifier si l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evenement) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    // Vérifier si l'utilisateur a déjà noté l'événement
    const existingRating = await prisma.ratingEvenement.findFirst({
      where: {
        evenementId: parseInt(id),
        utilisateurId: utilisateurId
      }
    });

    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté cet événement." });
    }

    // Créer la note
    const rating = await prisma.ratingEvenement.create({
      data: {
        evenementId: parseInt(id),
        utilisateurId: utilisateurId,
        noteOrganisateur: parseInt(noteOrganisateur),
        noteLieu: parseInt(noteLieu),
        noteAmbiance: parseInt(noteAmbiance),
        noteEvenement: parseInt(noteEvenement),
        commentaire
      }
    });

    // Envoyer un email de confirmation à l'administrateur
    const admin = await prisma.utilisateur.findFirst({
      where: { role: "ADMIN" }
    });

    if (admin) {
      await sendEmailToUser({
        to: admin.email,
        subject: "Nouvelle note pour un événement",
        text: `Une nouvelle note a été ajoutée pour l'événement "${evenement.titre}" par ${req.user.nom} ${req.user.prenom}.`
      });
    }

    res.status(201).json({
      message: "Note ajoutée avec succès.",
      rating
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la note:", error);
    res.status(500).json({
      message: "Erreur lors de l'ajout de la note.",
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir les notes d'un événement (Admin uniquement)
 * @method  GET
 * @route   /evenements/:id/ratings
 */
const getEvenementRatings = async (req, res) => {
  try {
    const { id } = req.params;

    const ratings = await prisma.ratingEvenement.findMany({
      where: {
        evenementId: parseInt(id)
      },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    // Calculer les moyennes
    const totalRatings = ratings.length;
    const moyennes = totalRatings > 0 ? {
      noteOrganisateur: ratings.reduce((acc, curr) => acc + curr.noteOrganisateur, 0) / totalRatings,
      noteLieu: ratings.reduce((acc, curr) => acc + curr.noteLieu, 0) / totalRatings,
      noteAmbiance: ratings.reduce((acc, curr) => acc + curr.noteAmbiance, 0) / totalRatings,
      noteEvenement: ratings.reduce((acc, curr) => acc + curr.noteEvenement, 0) / totalRatings
    } : null;

    res.status(200).json({
      ratings,
      moyennes,
      totalRatings
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des notes.",
      error: error.message
    });
  }
};

export { rateEvenement, getEvenementRatings }; 