import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @desc    Mettre à jour le statut en ligne d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {string} status - Statut en ligne (EN_LIGNE, HORS_LIGNE, INACTIF)
 * @returns {Promise<object>} Utilisateur mis à jour
 */
const updateOnlineStatus = async (userId, status) => {
  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: {
        statutEnLigne: status,
        derniereActivite: new Date()
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        statutEnLigne: true,
        derniereActivite: true
      }
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Marquer un utilisateur comme en ligne
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<object>} Utilisateur mis à jour
 */
const setUserOnline = async (userId) => {
  return updateOnlineStatus(userId, 'EN_LIGNE');
};

/**
 * @desc    Marquer un utilisateur comme hors ligne
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<object>} Utilisateur mis à jour
 */
const setUserOffline = async (userId) => {
  return updateOnlineStatus(userId, 'HORS_LIGNE');
};

/**
 * @desc    Marquer un utilisateur comme inactif
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<object>} Utilisateur mis à jour
 */
const setUserInactive = async (userId) => {
  return updateOnlineStatus(userId, 'INACTIF');
};

/**
 * @desc    Récupérer le statut en ligne de tous les utilisateurs
 * @returns {Promise<Array>} Liste des utilisateurs avec leur statut
 */
const getAllUsersOnlineStatus = async () => {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        photoProfil: true,
        statutEnLigne: true,
        derniereActivite: true
      },
      orderBy: {
        derniereActivite: 'desc'
      }
    });

    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Nettoyer les utilisateurs inactifs (plus de 5 minutes sans activité)
 * @returns {Promise<number>} Nombre d'utilisateurs mis à jour
 */
const cleanupInactiveUsers = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const result = await prisma.utilisateur.updateMany({
      where: {
        statutEnLigne: 'EN_LIGNE',
        derniereActivite: {
          lt: fiveMinutesAgo
        }
      },
      data: {
        statutEnLigne: 'HORS_LIGNE'
      }
    });

    return result.count;
  } catch (error) {
    throw error;
  }
};

/**
 * @desc    Mettre à jour la dernière activité d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<object>} Utilisateur mis à jour
 */
const updateLastActivity = async (userId) => {
  try {
    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: {
        derniereActivite: new Date()
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        statutEnLigne: true,
        derniereActivite: true
      }
    });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

export {
  updateOnlineStatus,
  setUserOnline,
  setUserOffline,
  setUserInactive,
  getAllUsersOnlineStatus,
  cleanupInactiveUsers,
  updateLastActivity
}; 