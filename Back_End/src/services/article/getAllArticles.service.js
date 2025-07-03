import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir tous les articles (Service Logic)
 * @returns {Promise<Array>} Liste de tous les articles
 */
const getAllArticlesService = async () => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        revue: true,
        createur: true,
        categories: true
      },
      orderBy: {
        dateSoumission: 'desc'
      }
    });

    return articles;
  } catch (error) {
    throw error;
  }
};

export { getAllArticlesService };
