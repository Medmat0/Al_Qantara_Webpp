import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";
import axios from "axios";

const prisma = new PrismaClient();

/**
 * Convertit une adresse en coordonnées géographiques
 * @param {string} adresse - L'adresse complète à convertir
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
const geocodeAddress = async (adresse) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: adresse,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'AlQantaraApp/1.0'
        }
      }
    );

    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      };
    }
    throw new Error('Adresse non trouvée');
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    throw error;
  }
};

/**
 * @desc    Obtenir la signature Cloudinary pour l'upload direct
 * @method  GET
 * @route   /evenements/cloudinary-signature
 */
const getCloudinarySignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "evenements"
      },
      process.env.CLOUD_SECRETS
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.CLOUD_KEY
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la signature:", error);
    res.status(500).json({
      message: "Erreur lors de la génération de la signature Cloudinary",
      error: error.message
    });
  }
};

/**
 * @desc    Ajouter un événement (Test sans authentification)
 * @method  POST
 * @route   /evenements
 */
const addEvenement = async (req, res) => {
  try {
    const {
      titre,
      description,
      dateDebut,
      dateFin,
      adresse,
      type,
      placesTotal,
      images, // Tableau d'URLs Cloudinary
      video // URL Cloudinary
    } = req.body;

    const existingEvenement = await prisma.evenement.findFirst({
      where: { titre }
    });

    if (existingEvenement) {
      return res.status(400).json({ message: "Un événement avec ce titre existe déjà." });
    }

    // Convertir l'adresse en coordonnées
    let coordinates = null;
    try {
      coordinates = await geocodeAddress(adresse);
    } catch (error) {
      console.error("Erreur lors de la conversion de l'adresse:", error);
      return res.status(400).json({ 
        message: "Impossible de convertir l'adresse en coordonnées géographiques. Veuillez vérifier l'adresse.",
        error: error.message 
      });
    }

    // Utiliser un utilisateur par défaut (ID 1) pour les tests
    //const defaultUserId = 1;
    const defaultUserId = req.user.id;
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
        images: images || [], // Utiliser directement les URLs Cloudinary
        video: video || null, // Utiliser directement l'URL Cloudinary
        createdBy: defaultUserId
      }
    });

    res.status(201).json({
      message: "Événement ajouté avec succès.",
      evenement: nouvelEvenement
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'événement:", error);
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'événement.",
      error: error.message
    });
  }
};

export { addEvenement, getCloudinarySignature }; 