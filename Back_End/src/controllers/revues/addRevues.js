import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";


const prisma = new PrismaClient();

/**
 * @desc    Ajouter une revue (Admin uniquement)
 * @method  POST
 * @route   /revues
 */
const addRevue = async (req, res) => {
  try {
    const { titre, description, mois, annee } = req.body;

    const existingRevue = await prisma.revue.findFirst({ where: { titre } });
    if (existingRevue) {
      return res.status(400).json({ message: "Une revue avec ce titre existe déjà." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Veuillez ajouter un fichier PDF." });
    }

    console.log(req.file.path);
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "revues",
      format: "pdf",
      access_mode: "public"  

    });

    const datePublication = new Date().toISOString();


    const nouvelleRevue = await prisma.revue.create({
      data: {
        titre,
        //description,
        //mois,
        //annee: parseInt(annee),
        fichier: uploadResult.secure_url, 
        datePublication : datePublication,
        createdBy: req.user.id,
      },
    });

    res.status(201).json({ message: "Revue ajoutée avec succès.", revue: nouvelleRevue });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout.", error: error.message });
  }
};

export {addRevue}