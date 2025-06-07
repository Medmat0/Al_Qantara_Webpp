import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "./geocodeAddress.service.js";

const prisma = new PrismaClient();

/**
 * @desc    Ajouter un événement (Service Logic)
 * @param {object} eventData - Data for the new event.
 * @param {number} userId - ID of the user creating the event.
 * @returns {Promise<object>} The newly created event.
 */
const addEvenementService = async (eventData, userId) => {
  try {
    const {
      titre,
      description,
      dateDebut,
      dateFin,
      adresse,
      type,
      placesTotal,
      images,
      video
    } = eventData;

    const existingEvenement = await prisma.evenement.findFirst({
      where: { titre }
    });

    if (existingEvenement) {
      throw new Error("Un événement avec ce titre existe déjà.");
    }

    let coordinates = null;
    try {
      coordinates = await geocodeAddress(adresse);
    } catch (error) {
      throw new Error(`Impossible de convertir l'adresse en coordonnées géographiques: ${error.message}`);
    }

    const nouvelEvenement = await prisma.evenement.create({
      data: {
        titre,
        description,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        lieu: adresse,
        type,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        placesTotal: placesTotal ? parseInt(placesTotal) : null,
        placesRestantes: placesTotal ? parseInt(placesTotal) : null,
        images: images || [],
        video: video || null,
        createdBy: userId
      }
    });
    return nouvelEvenement;
  } catch (error) {
    throw error;
  }
};

export { addEvenementService }; 