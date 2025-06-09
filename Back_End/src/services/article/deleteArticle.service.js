import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Supprimer un article (Service Logic)
 * @param {number} id - ID de l'article
 * @param {number} userId - ID de l'utilisateur effectuant la suppression
 * @returns {Promise<object>} L'article supprimé
 */
const deleteArticleService = async (id, userId) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { createur: true }
    });

    if (!article) {
      return null;
    }


    const deletedArticle = await prisma.article.delete({
      where: { id }
    });

    return deletedArticle;
  } catch (error) {
    throw error;
  }
};

export { deleteArticleService }; 