import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PointsInteretService {
  // Créer un nouveau point d'intérêt
  async createPointInteret(guideId, data) {
    const {
      nom,
      description,
      adresse,
      latitude,
      longitude,
      images,
      horairesOuverture,
      tarifs,
      telephone,
      siteWeb,
      email,
      typePoint = 'AUTRE',
      ordre
    } = data;

    // Déterminer l'ordre si non spécifié
    let finalOrdre = ordre;
    if (!finalOrdre) {
      const lastPoint = await prisma.pointInteret.findFirst({
        where: { guideId: parseInt(guideId) },
        orderBy: { ordre: 'desc' }
      });
      finalOrdre = lastPoint ? lastPoint.ordre + 1 : 1;
    }

    return await prisma.pointInteret.create({
      data: {
        nom,
        description,
        adresse,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        images: images || [],
        horairesOuverture,
        tarifs,
        telephone,
        siteWeb,
        email,
        typePoint,
        ordre: parseInt(finalOrdre),
        guideId: parseInt(guideId)
      },
      include: {
        guide: {
          select: { id: true, nom: true }
        }
      }
    });
  }

  // Obtenir tous les points d'intérêt d'un guide
  async getPointsInteretByGuide(guideId, filters = {}) {
    const { actif = true } = filters;

    const where = { guideId: parseInt(guideId) };
    if (actif !== 'all') {
      where.actif = actif === 'true';
    }

    return await prisma.pointInteret.findMany({
      where,
      orderBy: { ordre: 'asc' },
      include: {
        guide: {
          select: { id: true, nom: true }
        }
      }
    });
  }

  // Obtenir un point d'intérêt par ID
  async getPointInteretById(id) {
    return await prisma.pointInteret.findUnique({
      where: { id: parseInt(id) },
      include: {
        guide: {
          select: { id: true, nom: true }
        }
      }
    });
  }

  // Mettre à jour un point d'intérêt
  async updatePointInteret(id, updateData) {
    return await prisma.pointInteret.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        guide: {
          select: { id: true, nom: true }
        }
      }
    });
  }

  // Supprimer un point d'intérêt
  async deletePointInteret(id) {
    return await prisma.pointInteret.delete({
      where: { id: parseInt(id) }
    });
  }

  // Réorganiser l'ordre des points d'intérêt
  async reorderPointsInteret(guideId, pointsOrder) {
    const updatePromises = pointsOrder.map(({ id, ordre }) =>
      prisma.pointInteret.update({
        where: { 
          id: parseInt(id),
          guideId: parseInt(guideId)
        },
        data: { ordre: parseInt(ordre) }
      })
    );

    await Promise.all(updatePromises);

    return await this.getPointsInteretByGuide(guideId);
  }

  // Vérifier si un point d'intérêt existe
  async pointInteretExists(id) {
    const point = await prisma.pointInteret.findUnique({
      where: { id: parseInt(id) },
      select: { id: true }
    });
    return !!point;
  }
}

export default new PointsInteretService();
