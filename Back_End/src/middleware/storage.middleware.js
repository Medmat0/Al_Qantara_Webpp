import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "revues", // Dossier sur Cloudinary
    format: async () => "pdf", // Force PDF
    public_id: (req, file) => file.originalname.split(".")[0],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

export  {upload , storage};
