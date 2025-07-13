import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class GuidesService {
  // Créer un nouveau guide
  async createGuide(data) {
    const {
      nom,
      region,
      description,
      latitude,
      longitude,
      imageUrl,
      imageUrls,
      pointsInteret,
      creePar
    } = data;

    // S'assurer que pointsInteret est un array
    const pointsArray = Array.isArray(pointsInteret) ? pointsInteret : [];

    return await prisma.guide.create({
      data: {
        nom,
        region,
        description,
        image: imageUrl || '', // Fournir une chaîne vide si pas d'image
        images: imageUrls,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        createur: {
          connect: { id: creePar }
        },
        pointsInteret: {
          create: pointsArray.map((point, index) => ({
            nom: point.nom,
            description: point.description || null,
            adresse: point.adresse,
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
            images: point.images || [],
            horairesOuverture: point.horairesOuverture || null,
            tarifs: point.tarifs || null,
            telephone: point.telephone || null,
            siteWeb: point.siteWeb || null,
            email: point.email || null,
            typePoint: point.typePoint || 'AUTRE',
            ordre: index + 1
          }))
        }
      },
      include: {
        pointsInteret: {
          orderBy: { ordre: 'asc' }
        },
        createur: {
          select: { id: true, nom: true, prenom: true }
        }
      }
    });
  }

  // Obtenir tous les guides avec pagination
  async getAllGuides(filters) {
    const { actif = true, page = 1, limit = 10 } = filters;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (actif !== 'all') {
      where.actif = actif === 'true';
    }

    const [guides, total] = await Promise.all([
      prisma.guide.findMany({
        where,
        include: {
          pointsInteret: {
            where: { actif: true },
            orderBy: { ordre: 'asc' }
          },
          createur: {
            select: { id: true, nom: true, prenom: true }
          },
          _count: {
            select: { pointsInteret: true }
          }
        },
        orderBy: { dateCreation: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.guide.count({ where })
    ]);

    return {
      guides,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // Obtenir un guide par ID
  async getGuideById(id) {
    return await prisma.guide.findUnique({
      where: { id: parseInt(id) },
      include: {
        pointsInteret: {
          where: { actif: true },
          orderBy: { ordre: 'asc' }
        },
        createur: {
          select: { id: true, nom: true, prenom: true }
        }
      }
    });
  }

  // Mettre à jour un guide
  async updateGuide(id, updateData) {
    return await prisma.guide.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pointsInteret: {
          where: { actif: true },
          orderBy: { ordre: 'asc' }
        },
        createur: {
          select: { id: true, nom: true, prenom: true }
        }
      }
    });
  }

  // Supprimer un guide
  async deleteGuide(id) {
    return await prisma.guide.delete({
      where: { id: parseInt(id) }
    });
  }

  // Vérifier si un guide existe
  async guideExists(id) {
    const guide = await prisma.guide.findUnique({
      where: { id: parseInt(id) },
      select: { id: true }
    });
    return !!guide;
  }
}

export default new GuidesService();
