import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Obtenir un article par son ID (Service Logic)
 * @param {number} id - ID de l'article
 * @returns {Promise<object>} L'article trouvé
 */
const getArticleByIdService = async (id) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        revue: true,
        createur: true,
        categories: true
      }
    });

    return article;
  } catch (error) {
    throw error;
  }
};

export { getArticleByIdService };
