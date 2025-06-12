import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Créer un nouvel article
 * @param {object} articleData - Données de l'article à créer
 * @returns {Promise<object>} L'article créé
 */
const createArticleService = async (articleData) => {
  try {
    const { titre, contenu, auteur, revueId, createdBy, categories } = articleData;

    // Vérifier si la revue existe
    const revue = await prisma.revue.findUnique({
      where: { id: revueId }
    });

    if (!revue) {
      throw new Error("La revue spécifiée n'existe pas.");
    }

    // Créer l'article avec ses catégories
    const article = await prisma.article.create({
      data: {
        titre,
        contenu,
        auteur,
        dateSoumission: new Date(),
        createdBy,
        revueId,
        categories: {
          connect: categories?.map(catId => ({ id: catId })) || []
        }
      },
      include: {
        categories: true,
        revue: true,
        createur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    return article;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Récupérer toutes les catégories d'articles
 * @returns {Promise<Array>} Liste des catégories
 */
const getAllCategories = async () => {
  try {
    return await prisma.categorieArticle.findMany();
  } catch (error) {
    throw error;
  }
};

export { createArticleService, getAllCategories };
export { getArticleByIdService } from './getArticleById.service.js';
export { getAllArticlesService } from './getAllArticles.service.js';
export { getArticlesByRevueService } from './getArticlesByRevue.service.js';
export { updateArticleService } from './updateArticle.service.js';
export { deleteArticleService } from './deleteArticle.service.js';
