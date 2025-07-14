import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20 // Maximum 20 fichiers
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Middleware pour les uploads multiples
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 }, // Image principale
  { name: 'images', maxCount: 10 } // Images de galerie
]);

// Middleware pour upload d'images multiples
export const uploadImages = upload.array('images', 10);

// Utilitaire pour uploader une image principale
export const uploadMainImage = async (file) => {
  if (!file) return null;
  
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'guides/main',
    transformation: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto' }
    ]
  });
  
  return result.secure_url;
};

// Utilitaire pour uploader plusieurs images de galerie
export const uploadGalleryImages = async (files) => {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map(file => 
    cloudinary.uploader.upload(file.path, {
      folder: 'guides/gallery',
      transformation: [
        { width: 600, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    })
  );
  
  const results = await Promise.all(uploadPromises);
  return results.map(result => result.secure_url);
};

// Utilitaire pour uploader des images de points d'intérêt
export const uploadPointInteretImages = async (files) => {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map(file => 
    cloudinary.uploader.upload(file.path, {
      folder: 'points-interet',
      transformation: [
        { width: 600, height: 400, crop: 'fill' },
        { quality: 'auto' }
      ]
    })
  );
  
  const results = await Promise.all(uploadPromises);
  return results.map(result => result.secure_url);
};

// Middleware de gestion d'erreur pour multer
export const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Taille maximale : 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers. Maximum autorisé : 20 fichiers'
      });
    }
  }
  
  if (error.message === 'Seules les images sont autorisées') {
    return res.status(400).json({
      success: false,
      message: 'Seules les images sont autorisées'
    });
  }
  
  next(error);
};
