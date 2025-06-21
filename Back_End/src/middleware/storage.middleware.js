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
  limits: { fileSize: 20 * 1024 * 1024 }, // Limite de 20MB
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
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
});

const logoCommunitiesStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "logoCommunities", // Dossier sur Cloudinary
        format: async () =>"png", // Force PNG
    },
});


const uploadlogoCommunities = multer({
    storage: logoCommunitiesStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
});


export  {uploadRevue , revueStorage,candidatureStorage, uploadCandidature, uploadlogoCommunities, logoCommunitiesStorage};
