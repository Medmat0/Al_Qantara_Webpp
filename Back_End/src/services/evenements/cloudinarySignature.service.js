import cloudinary from "../../config/cloudinary.js";

/**
 * @desc    Obtenir la signature Cloudinary pour l'upload direct
 * @param {string} folder - The Cloudinary folder to sign for.
 * @returns {Promise<{signature: string, timestamp: number, cloudName: string, apiKey: string}>}
 */
const getCloudinarySignatureService = async (folder) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder
      },
      process.env.CLOUD_SECRETS
    );

    return {
      signature,
      timestamp,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.CLOUD_KEY
    };
  } catch (error) {
    console.error("Erreur lors de la génération de la signature:", error);
    throw new Error("Erreur lors de la génération de la signature Cloudinary");
  }
};

export { getCloudinarySignatureService }; 