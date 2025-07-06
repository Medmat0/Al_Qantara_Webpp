
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// GET all associations
export const getAllAssociations = async (req, res) => {
  try {
    const associations = await prisma.association.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ associations });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des associations.' });
  }
};

// POST create association
export const createAssociation = async (req, res) => {
  try {
    const { titre, image, description, coordonnees, url, instaUrl } = req.body;
    if (!titre) return res.status(400).json({ error: 'Le titre est requis.' });
    const association = await prisma.association.create({
      data: { titre, image, description, coordonnees, url, instaUrl }
    });
    res.status(201).json({ association });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'association.' });
  }
};

// DELETE association
export const deleteAssociation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.association.delete({ where: { id: Number(id) } });
    res.json({ message: 'Association supprimée.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'association.' });
  }
};
