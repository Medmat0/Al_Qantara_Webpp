import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


class AssociationService {
  // Créer une nouvelle association (par admin)
  async creerAssociation(req) {
    try {
      // Construire dynamiquement l'objet data sans undefined/null
      const data = {};
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
          // Pour la date, convertir en Date
          if (key === 'dateCreation') {
            data[key] = new Date(req.body[key]);
          } else {
            data[key] = req.body[key];
          }
        }
      });
      // Ajouter le logo si présent
      if (req.file) {
        data.logo = req.file.path;
      }
      const association = await prisma.association.create({ data });
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
            adresse: true,
            ville: true,
            codePostal: true,
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

      // Nettoyer les logos invalides (temporairement désactivé)
      // const cleanedAssociations = associations.map(association => ({
      //   ...association,
      //   logo: this.cleanLogoUrl(association.logo)
      // }));

      return {
        associations: associations, // Retour direct sans nettoyage
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

      // Nettoyer les logos invalides pour l'admin aussi (temporairement désactivé)
      // const cleanedAssociations = associations.map(association => ({
      //   ...association,
      //   logo: this.cleanLogoUrl(association.logo)
      // }));

      return {
        associations: associations, // Retour direct sans nettoyage
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
          _count: true
        }),
        prisma.association.groupBy({
          by: ['secteurActivite'],
          where: { 
            secteurActivite: { not: null }
          },
          _count: true
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

  // Méthode utilitaire pour nettoyer les URLs de logos invalides
  cleanLogoUrl(logoUrl) {
    if (!logoUrl || 
        logoUrl.trim() === '' || 
        logoUrl === 'null' || 
        logoUrl === 'undefined') {
      return null;
    }
    
    // Pour les URLs blob, on les garde pour l'instant mais on pourrait les traiter différemment
    // En production, il faudrait un système d'upload proper
    if (logoUrl.startsWith('blob:')) {
      console.warn('URL blob détectée pour un logo, cela ne fonctionnera pas correctement:', logoUrl);
      // Pour l'instant, on retourne null pour les blobs car ils ne marchent pas
      return null;
    }
    
    return logoUrl;
  }
}

export default new AssociationService();
