import crypto from 'crypto';
import asyncHandler from "express-async-handler";

/**
 * @desc    Générer une signature Cloudinary
 * @method  GET
 * @route   /user/cloudinary-signature
 * @access  Private
 */
const getCloudinarySignature = asyncHandler(async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiKey = process.env.CLOUD_KEY;
  const apiSecret = process.env.CLOUD_SECRETS;
  const cloudName = process.env.CLOUD_NAME;

  // Créer la signature
  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  res.json({
    signature,
    timestamp,
    cloudName,
    apiKey
  });
});

export { getCloudinarySignature }; 