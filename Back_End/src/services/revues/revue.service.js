import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();

const addRevueService = async (data, file, userId) => {
  try {
    const { titre, description, mois, annee } = data;

    const existingRevue = await prisma.revue.findFirst({ where: { titre } });
    if (existingRevue) {
      throw new Error("Une revue avec ce titre existe déjà.");
    }

    if (!file) {
      throw new Error("Veuillez ajouter un fichier PDF.");
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
      folder: "revues",
      format: "pdf",
      access_mode: "public",
    });

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error("Erreur lors du téléchargement du fichier.");
    }

    const datePublication = new Date().toISOString();

    const nouvelleRevue = await prisma.revue.create({
      data: {
        titre,
        description,
        mois,
        annee: annee.toString(),
        fichier: uploadResult.secure_url,
        datePublication: datePublication,
        createdBy: userId,
      },
    });
    return nouvelleRevue;
  } catch (error) {
    throw error;
  }
};

const getRevuesService = async () => {
  try {
    const revues = await prisma.revue.findMany({
      select: {
        titre: true,
        nombreVues: true,
        nombreTelechargements: true,
        description: true,
        mois: true,
        annee: true,
        id: true,
        fichier: true,
        datePublication: true,
        createdBy: true,
      },
      orderBy: { datePublication: "desc" },
    });
    return revues;
  } catch (error) {
    throw error;
  }
};

const getRevueByIdService = async (revueId) => {
  try {
    const revue = await prisma.revue.findUnique({
      where: { id: parseInt(revueId) },
      select: {
        titre: true,
        nombreVues: true,
        nombreTelechargements: true,
        description: true,
        mois: true,
        annee: true,
        id: true,
        fichier: true,
        datePublication: true,
        createdBy: true,
      },
    });

    if (!revue) {
      throw new Error("Revue non trouvée.");
    }
    return revue;
  } catch (error) {
    throw error;
  }
};

const incrementVueService = async (revueId) => {
  try {
    const revue = await prisma.revue.findUnique({
      where: { id: revueId },
    });

    if (!revue) {
      throw new Error("Revue non trouvée");
    }

    await prisma.revue.update({
      where: { id: revueId },
      data: {
        nombreVues: { increment: 1 },
      },
    });
    return { message: "Vue enregistrée" };
  } catch (error) {
    throw error;
  }
};

const incrementTelechargementService = async (revueId) => {
  try {
    const revue = await prisma.revue.findUnique({
      where: { id: revueId },
    });

    if (!revue) {
      throw new Error("Revue non trouvée");
    }

    await prisma.revue.update({
      where: { id: revueId },
      data: {
        nombreTelechargements: { increment: 1 }
      }
    });
    return { message: "Téléchargement enregistré" };
  } catch (error) {
    throw error;
  }
};

const deleteRevueService = async (revueId) => {
  try {
    const revue = await prisma.revue.findUnique({ where: { id: parseInt(revueId) } });
    if (!revue) {
      throw new Error("Revue non trouvée.");
    }

    const fileUrl = revue.fichier || revue.document; 
    if (!fileUrl) {
      throw new Error("Aucun fichier associé à cette revue.");
    }

    const publicId = fileUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`revues/${publicId}`);

    await prisma.revue.delete({ where: { id: parseInt(revueId) } });

    return { message: "Revue supprimée avec succès." };
  } catch (error) {
    throw error;
  }
};

export { addRevueService, getRevuesService, getRevueByIdService, incrementVueService, incrementTelechargementService, deleteRevueService }; 