import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const revueStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "revues", // Dossier sur Cloudinary
    format: async () => "pdf", // Force PDF
    public_id: (req, file) => file.originalname.split(".")[0],
  },
});

const uploadRevue = multer({
  storage: revueStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

const candidatureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "candidatures", // Dossier sur Cloudinary
    format: async () => "pdf" // Force PDF
  },
});

const uploadCandidature = multer({
  storage: candidatureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});


export  {uploadRevue , revueStorage,candidatureStorage, uploadCandidature};
