import axios from "axios";

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

export { geocodeAddress }; 