import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Créer un nouvel article (Service Logic)
 * @param {object} articleData - Data for the new article
 * @returns {Promise<object>} The newly created article
 */
const createArticleService = async (articleData) => {
  try {
    const { titre, contenu, auteur, revueId, createdBy } = articleData;

    const existingArticle = await prisma.article.findFirst({
      where: { titre }
    });

    if (existingArticle) {
      throw new Error("Un article avec ce titre existe déjà.");
    }

    // Créer le nouvel article
    const nouvelArticle = await prisma.article.create({
      data: {
        titre,
        contenu,
        auteur,
        revueId,
        createdBy,
        dateSoumission: new Date(),
      },
      include: {
        revue: true,
        createur: true
      }
    });

    return nouvelArticle;
  } catch (error) {
    throw error;
  }
};

export { createArticleService }; 