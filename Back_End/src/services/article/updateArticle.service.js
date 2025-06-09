import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Mettre à jour un article (Service Logic)
 * @param {number} id - ID de l'article
 * @param {object} data - Données à mettre à jour
 * @param {number} userId - ID de l'utilisateur effectuant la mise à jour
 * @returns {Promise<object>} L'article mis à jour
 */
const updateArticleService = async (id, data, userId) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { createur: true }
    });

    if (!article) {
      return null;
    }

    

    const updatedArticle = await prisma.article.update({
      where: { id },
      data,
      include: {
        revue: true,
        createur: true
      }
    });

    return updatedArticle;
  } catch (error) {
    throw error;
  }
};

export { updateArticleService }; 