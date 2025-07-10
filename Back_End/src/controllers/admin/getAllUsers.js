import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Récupérer tous les utilisateurs avec statistiques détaillées (Admin uniquement)
 * @method  GET
 * @route   /admin/users
 * @returns {Object} - Liste des utilisateurs avec statistiques complètes
 */
const getAllUsers = async (req, res) => {
  try {
    // Récupérer tous les utilisateurs avec leurs relations
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        statut: true,
        dateInscription: true,
        emailVerified: true,
        derniereActivite: true,
        statutEnLigne: true,
        adhesion: {
          select: {
            statut: true,
            dateDemande: true
          }
        },
        dons: {
          select: {
            montant: true,
            dateDon: true,
            statut: true
          }
        },
        participations: {
          select: {
            statut: true,
            dateParticipation: true
          }
        },
        paiements: {
          select: {
            montant: true,
            statut: true,
            datePaiement: true
          }
        }
      },
      orderBy: {
        dateInscription: 'desc'
      }
    });

    if (users.length === 0) {
      return res.status(200).json({
        message: "Aucun utilisateur trouvé dans la base de données.",
        users: [],
        count: 0,
        stats: {
          totalUsers: 0,
          totalAdherents: 0,
          totalDons: 0,
          totalRevenueAdhesions: 0,
          totalRevenueDons: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          newUsersThisMonth: 0,
          newAdherentsThisMonth: 0,
          averageDonAmount: 0
        }
      });
    }

    // Calcul des statistiques globales
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Statistiques des adhésions
    const adhesions = await prisma.adhesion.findMany({
      where: { statut: 'ACCEPTE' },
      select: {
        dateDemande: true,
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    // Statistiques des dons
    const dons = await prisma.don.findMany({
      where: { statut: 'VALIDE' },
      select: {
        montant: true,
        dateDon: true,
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    // Prix d'adhésion fixe (vous pouvez le configurer)
    const PRIX_ADHESION = 20; // À adapter selon votre tarif

    // Calculer les statistiques
    const stats = {
      totalUsers: users.length,
      totalAdherents: users.filter(u => u.role === 'ADHERENT' || u.adhesion?.statut === 'ACCEPTE').length,
      totalDons: dons.length,
      totalRevenueAdhesions: adhesions.length * PRIX_ADHESION,
      totalRevenueDons: dons.reduce((sum, don) => sum + don.montant, 0),
      activeUsers: users.filter(u => u.statut === 'ACTIF').length,
      inactiveUsers: users.filter(u => u.statut === 'INACTIF').length,
      newUsersThisMonth: users.filter(u => new Date(u.dateInscription) >= firstDayOfMonth).length,
      newAdherentsThisMonth: adhesions.filter(a => new Date(a.dateDemande) >= firstDayOfMonth).length,
      averageDonAmount: dons.length > 0 ? dons.reduce((sum, don) => sum + don.montant, 0) / dons.length : 0,
      // Statistiques par rôle
      adminCount: users.filter(u => u.role === 'ADMIN').length,
      userCount: users.filter(u => u.role === 'USER').length,
      adherentCount: users.filter(u => u.role === 'ADHERENT').length,
      // Statistiques d'activité
      usersOnline: users.filter(u => u.statutEnLigne === 'EN_LIGNE').length,
      usersOffline: users.filter(u => u.statutEnLigne === 'HORS_LIGNE').length,
      // Revenus par mois (derniers 6 mois)
      revenueByMonth: await getRevenueByMonth(),
      // Adhésions récentes (5 dernières)
      recentAdhesions: adhesions
        .sort((a, b) => new Date(b.dateDemande) - new Date(a.dateDemande))
        .slice(0, 5)
        .map(a => ({
          utilisateur: a.utilisateur,
          dateAdhesion: a.dateDemande,
          montant: PRIX_ADHESION
        })),
      // Dons récents (5 derniers)
      recentDons: dons
        .sort((a, b) => new Date(b.dateDon) - new Date(a.dateDon))
        .slice(0, 5)
        .map(d => ({
          utilisateur: d.utilisateur,
          dateDon: d.dateDon,
          montant: d.montant
        }))
    };

    // Formater les utilisateurs avec leurs données enrichies
    const formattedUsers = users.map(user => {
      const totalDonsUser = user.dons
        .filter(don => don.statut === 'VALIDE')
        .reduce((sum, don) => sum + don.montant, 0);
      
      const totalPaiementsUser = user.paiements
        .filter(p => p.statut === 'VALIDE')
        .reduce((sum, p) => sum + p.montant, 0);

      return {
        ...user,
        statutAdhesion: user.adhesion?.statut || 'NON_DEMANDE',
        totalDons: totalDonsUser,
        nombreDons: user.dons.filter(don => don.statut === 'VALIDE').length,
        totalPaiementsEvenements: totalPaiementsUser,
        nombreParticipations: user.participations.length,
        dernierDon: user.dons.length > 0 ? 
          user.dons.sort((a, b) => new Date(b.dateDon) - new Date(a.dateDon))[0].dateDon : null,
        // Retirer les tableaux détaillés pour alléger la réponse
        dons: undefined,
        participations: undefined,
        paiements: undefined
      };
    });

    res.status(200).json({
      message: `${formattedUsers.length} utilisateurs récupérés avec succès.`,
      users: formattedUsers,
      count: formattedUsers.length,
      stats: stats
    });

  } catch (error) {
    console.error("Erreur dans getAllUsers:", error);
    res.status(500).json({ 
      message: "Erreur serveur lors de la récupération des utilisateurs.",
      error: error.message 
    });
  }
};

/**
 * Fonction utilitaire pour calculer les revenus par mois
 */
async function getRevenueByMonth() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Revenus des adhésions par mois
    const adhesionsByMonth = await prisma.adhesion.findMany({
      where: {
        statut: 'ACCEPTE',
        dateDemande: {
          gte: sixMonthsAgo
        }
      },
      select: {
        dateDemande: true
      }
    });

    // Revenus des dons par mois
    const donsByMonth = await prisma.don.findMany({
      where: {
        statut: 'VALIDE',
        dateDon: {
          gte: sixMonthsAgo
        }
      },
      select: {
        dateDon: true,
        montant: true
      }
    });

    // Organiser par mois
    const revenueByMonth = {};
    const PRIX_ADHESION = 20; // Prix d'adhésion fixe, à adapter selon votre tarif

    // Initialiser les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[monthKey] = {
        adhesions: 0,
        dons: 0,
        total: 0
      };
    }

    // Ajouter les revenus d'adhésions
    adhesionsByMonth.forEach(adhesion => {
      const date = new Date(adhesion.dateDemande);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (revenueByMonth[monthKey]) {
        revenueByMonth[monthKey].adhesions += PRIX_ADHESION;
        revenueByMonth[monthKey].total += PRIX_ADHESION;
      }
    });

    // Ajouter les revenus de dons
    donsByMonth.forEach(don => {
      const date = new Date(don.dateDon);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (revenueByMonth[monthKey]) {
        revenueByMonth[monthKey].dons += don.montant;
        revenueByMonth[monthKey].total += don.montant;
      }
    });

    return revenueByMonth;
  } catch (error) {
    console.error('Erreur lors du calcul des revenus par mois:', error);
    return {};
  }
}

export { getAllUsers };