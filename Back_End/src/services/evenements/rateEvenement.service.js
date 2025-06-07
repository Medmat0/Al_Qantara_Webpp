import { PrismaClient } from "@prisma/client";
import { sendEmailToUser } from "../../utils/email.config.js";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter une note à un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @param {object} ratingData - Data for the rating (noteOrganisateur, noteLieu, noteAmbiance, noteEvenement, commentaire).
 * @param {number} utilisateurId - ID of the user adding the rating.
 * @returns {Promise<object>} The newly created rating.
 */
const rateEvenementService = async (evenementId, ratingData, utilisateurId) => {
  try {
    const {
      noteOrganisateur,
      noteLieu,
      noteAmbiance,
      noteEvenement,
      commentaire
    } = ratingData;

    const evenement = await prisma.evenement.findUnique({
      where: { id: parseInt(evenementId) }
    });

    if (!evenement) {
      throw new Error("Événement non trouvé.");
    }

    const existingRating = await prisma.ratingEvenement.findFirst({
      where: {
        evenementId: parseInt(evenementId),
        utilisateurId: utilisateurId
      }
    });

    if (existingRating) {
      throw new Error("Vous avez déjà noté cet événement.");
    }

    const rating = await prisma.ratingEvenement.create({
      data: {
        evenementId: parseInt(evenementId),
        utilisateurId: utilisateurId,
        noteOrganisateur: parseInt(noteOrganisateur),
        noteLieu: parseInt(noteLieu),
        noteAmbiance: parseInt(noteAmbiance),
        noteEvenement: parseInt(noteEvenement),
        commentaire
      }
    });

    const admin = await prisma.utilisateur.findFirst({
      where: { role: "ADMIN" }
    });

    if (admin) {
      await sendEmailToUser({
        to: admin.email,
        subject: "Nouvelle note pour un événement",
        text: `Une nouvelle note a été ajoutée pour l'événement "${evenement.titre}".`
      });
    }
    return rating;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Obtenir les notes d'un événement (Service Logic)
 * @param {string} evenementId - ID of the event.
 * @returns {Promise<object>} Ratings and calculated averages.
 */
const getEvenementRatingsService = async (evenementId) => {
  try {
    const ratings = await prisma.ratingEvenement.findMany({
      where: {
        evenementId: parseInt(evenementId)
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

    const totalRatings = ratings.length;
    const moyennes = totalRatings > 0 ? {
      noteOrganisateur: ratings.reduce((acc, curr) => acc + curr.noteOrganisateur, 0) / totalRatings,
      noteLieu: ratings.reduce((acc, curr) => acc + curr.noteLieu, 0) / totalRatings,
      noteAmbiance: ratings.reduce((acc, curr) => acc + curr.noteAmbiance, 0) / totalRatings,
      noteEvenement: ratings.reduce((acc, curr) => acc + curr.noteEvenement, 0) / totalRatings
    } : null;

    return {
      ratings,
      moyennes,
      totalRatings
    };
  } catch (error) {
    throw error;
  }
};

export { rateEvenementService, getEvenementRatingsService }; 