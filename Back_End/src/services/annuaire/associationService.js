import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class AssociationService {

  // Créer une nouvelle association (par admin)
  async creerAssociation(associationData) {
    try {
      const association = await prisma.association.create({
        data: associationData
      });
      
      return association;
    } catch (error) {
      console.error('Erreur lors de la création de l\'association:', error);
      throw new Error('Erreur lors de la création de l\'association');
    }
  }

  // Récupérer toutes les associations (pour l'annuaire public)
  async getAssociationsPubliques(filtres = {}) {
    try {
      const { ville, region, secteurActivite, recherche, page = 1, limite = 20 } = filtres;
      
      const where = {
        ...(ville && { ville: { contains: ville, mode: 'insensitive' } }),
        ...(region && { region: { contains: region, mode: 'insensitive' } }),
        ...(secteurActivite && { secteurActivite }),
        ...(recherche && {
          OR: [
            { nom: { contains: recherche, mode: 'insensitive' } },
            { description: { contains: recherche, mode: 'insensitive' } },
            { ville: { contains: recherche, mode: 'insensitive' } }
          ]
        })
      };

      const [associations, total] = await Promise.all([
        prisma.association.findMany({
          where,
          orderBy: { nom: 'asc' },
          skip: (page - 1) * limite,
          take: parseInt(limite),
          select: {
            id: true,
            nom: true,
            logo: true,
            description: true,
            secteurActivite: true,
            ville: true,
            region: true,
            telephone: true,
            email: true,
            siteWeb: true,
            facebook: true,
            instagram: true,
            twitter: true,
            linkedin: true,
            dateCreation: true
          }
        }),
        prisma.association.count({ where })
      ]);

      return {
        associations,
        pagination: {
          page: parseInt(page),
          limite: parseInt(limite),
          total,
          pages: Math.ceil(total / limite)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des associations publiques:', error);
      throw new Error('Erreur lors de la récupération des associations');
    }
  }

  // Récupérer une association par ID (public)
  async getAssociationPublique(id) {
    try {
      const association = await prisma.association.findUnique({
        where: {
          id: parseInt(id)
        }
      });

      if (!association) {
        throw new Error('Association non trouvée');
      }

      return association;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'association:', error);
      throw new Error('Association non trouvée');
    }
  }

  // Admin: Récupérer toutes les associations
  async getAllAssociationsAdmin(filtres = {}) {
    try {
      const { page = 1, limite = 20 } = filtres;

      const [associations, total] = await Promise.all([
        prisma.association.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limite,
          take: parseInt(limite)
        }),
        prisma.association.count()
      ]);

      return {
        associations,
        pagination: {
          page: parseInt(page),
          limite: parseInt(limite),
          total,
          pages: Math.ceil(total / limite)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des associations (admin):', error);
      throw new Error('Erreur lors de la récupération des associations');
    }
  }

  // Admin: Modifier une association
  async modifierAssociation(id, donneesModifiees) {
    try {
      const association = await prisma.association.update({
        where: { id: parseInt(id) },
        data: {
          ...donneesModifiees,
          updatedAt: new Date()
        }
      });

      return association;
    } catch (error) {
      console.error('Erreur lors de la modification de l\'association:', error);
      throw new Error('Erreur lors de la modification de l\'association');
    }
  }

  // Admin: Supprimer une association
  async supprimerAssociation(id) {
    try {
      await prisma.association.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Association supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'association:', error);
      throw new Error('Erreur lors de la suppression de l\'association');
    }
  }

  // Obtenir les statistiques de l'annuaire
  async getStatistiques() {
    try {
      const [total, parRegion, parSecteur] = await Promise.all([
        prisma.association.count(),
        prisma.association.groupBy({
          by: ['region'],
          where: { 
            region: { not: null }
          },
          _count: true,
          orderBy: { _count: 'desc' }
        }),
        prisma.association.groupBy({
          by: ['secteurActivite'],
          where: { 
            statut: 'VALIDEE',
            secteurActivite: { not: null }
          },
        }),
        prisma.association.groupBy({
          by: ['secteurActivite'],
          where: { 
            secteurActivite: { not: null }
          },
          _count: true,
          orderBy: { _count: { secteurActivite: 'desc' } }
        })
      ]);

      return {
        total,
        repartitionParRegion: parRegion,
        repartitionParSecteur: parSecteur
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  // Obtenir les secteurs d'activité disponibles
  async getSecteursActivite() {
    try {
      const secteurs = await prisma.association.findMany({
        where: { 
          secteurActivite: { not: null }
        },
        select: { secteurActivite: true },
        distinct: ['secteurActivite']
      });

      return secteurs.map(s => s.secteurActivite).filter(Boolean);
    } catch (error) {
      console.error('Erreur lors de la récupération des secteurs:', error);
      throw new Error('Erreur lors de la récupération des secteurs');
    }
  }

  // Obtenir les régions disponibles
  async getRegions() {
    try {
      const regions = await prisma.association.findMany({
        where: { 
          region: { not: null }
        },
        select: { region: true },
        distinct: ['region']
      });

      return regions.map(r => r.region).filter(Boolean);
    } catch (error) {
      console.error('Erreur lors de la récupération des régions:', error);
      throw new Error('Erreur lors de la récupération des régions');
    }
  }
}

export default new AssociationService();
