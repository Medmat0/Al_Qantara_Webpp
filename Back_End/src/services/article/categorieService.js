import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Créer une nouvelle catégorie
 * @param {object} categorieData - Données de la catégorie
 * @returns {Promise<object>} La catégorie créée
 */
const createCategorieService = async (categorieData) => {
  try {
    const { nom, description } = categorieData;

    // Vérifier si la catégorie existe déjà
    const existingCategorie = await prisma.categorieArticle.findFirst({
      where: { nom }
    });

    if (existingCategorie) {
      throw new Error("Une catégorie avec ce nom existe déjà.");
    }

    const categorie = await prisma.categorieArticle.create({
      data: {
        nom,
        description
      }
    });

    return categorie;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Récupérer toutes les catégories
 * @returns {Promise<Array>} Liste des catégories
 */
const getAllCategoriesService = async () => {
  try {
    const categories = await prisma.categorieArticle.findMany({
      orderBy: {
        nom: 'asc'
      },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    // Transformer les données pour un format plus propre
    return categories.map(category => ({
      id: category.id,
      nom: category.nom,
      description: category.description,
      nombreArticles: category._count.articles
    }));
  } catch (error) {
    console.error("Erreur dans getAllCategoriesService:", error);
    throw error;
  }
};

/**
 * @desc    Récupérer une catégorie par son ID
 * @param {number} id - ID de la catégorie
 * @returns {Promise<object>} La catégorie
 */
const getCategorieByIdService = async (id) => {
  try {
    const categorie = await prisma.categorieArticle.findUnique({
      where: { id },
      include: {
        articles: true
      }
    });

    if (!categorie) {
      throw new Error("Catégorie non trouvée.");
    }

    return categorie;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Mettre à jour une catégorie
 * @param {number} id - ID de la catégorie
 * @param {object} categorieData - Nouvelles données de la catégorie
 * @returns {Promise<object>} La catégorie mise à jour
 */
const updateCategorieService = async (id, categorieData) => {
  try {
    const { nom, description } = categorieData;

    // Vérifier si la catégorie existe
    const existingCategorie = await prisma.categorieArticle.findUnique({
      where: { id }
    });

    if (!existingCategorie) {
      throw new Error("Catégorie non trouvée.");
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé
    if (nom !== existingCategorie.nom) {
      const duplicateCategorie = await prisma.categorieArticle.findFirst({
        where: { nom }
      });

      if (duplicateCategorie) {
        throw new Error("Une catégorie avec ce nom existe déjà.");
      }
    }

    const categorie = await prisma.categorieArticle.update({
      where: { id },
      data: {
        nom,
        description
      }
    });

    return categorie;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Supprimer une catégorie
 * @param {number} id - ID de la catégorie
 * @returns {Promise<object>} Message de confirmation
 */
const deleteCategorieService = async (id) => {
  try {
    // Vérifier si la catégorie existe
    const existingCategorie = await prisma.categorieArticle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    if (!existingCategorie) {
      throw new Error("Catégorie non trouvée.");
    }

    // Vérifier si la catégorie est utilisée
    if (existingCategorie._count.articles > 0) {
      throw new Error("Impossible de supprimer une catégorie qui contient des articles.");
    }

    await prisma.categorieArticle.delete({
      where: { id }
    });

    return { message: "Catégorie supprimée avec succès." };
  } catch (error) {
    throw error;
  }
};

export {
  createCategorieService,
  getAllCategoriesService,
  getCategorieByIdService,
  updateCategorieService,
  deleteCategorieService
}; 