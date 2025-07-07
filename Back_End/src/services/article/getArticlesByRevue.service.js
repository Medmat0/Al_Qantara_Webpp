import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir tous les articles d'une revue (Service Logic)
 * @param {number} revueId - ID de la revue
 * @returns {Promise<Array>} Liste des articles de la revue
 */
const getArticlesByRevueService = async (revueId) => {
  try {
    const articles = await prisma.article.findMany({
      where: { revueId },
      include: {
        createur: true
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

export { getArticlesByRevueService }; 