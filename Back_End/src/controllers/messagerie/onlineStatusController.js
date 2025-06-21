import {
  setUserOnline,
  setUserOffline,
  setUserInactive,
  getAllUsersOnlineStatus,
  updateLastActivity
} from "../../services/messagerie/onlineStatusService.js";

/**
 * @desc    Marquer un utilisateur comme en ligne
 * @method  POST
 * @route   /messages/online-status/online
 */
const markUserOnline = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    const updatedUser = await setUserOnline(Number(userId));

    // Notifier les autres utilisateurs du changement de statut
    req.io.emit('userStatusChanged', {
      userId: updatedUser.id,
      status: 'EN_LIGNE',
      user: {
        id: updatedUser.id,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom
      }
    });

    res.status(200).json({
      message: "Utilisateur marqué comme en ligne",
      data: updatedUser
    });
  } catch (error) {
    console.error("Erreur lors du marquage en ligne:", error);
    res.status(500).json({
      message: "Erreur lors du marquage en ligne",
      error: error.message
    });
  }
};

/**
 * @desc    Marquer un utilisateur comme hors ligne
 * @method  POST
 * @route   /messages/online-status/offline
 */
const markUserOffline = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    const updatedUser = await setUserOffline(Number(userId));

    // Notifier les autres utilisateurs du changement de statut
    req.io.emit('userStatusChanged', {
      userId: updatedUser.id,
      status: 'HORS_LIGNE',
      user: {
        id: updatedUser.id,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom
      }
    });

    res.status(200).json({
      message: "Utilisateur marqué comme hors ligne",
      data: updatedUser
    });
  } catch (error) {
    console.error("Erreur lors du marquage hors ligne:", error);
    res.status(500).json({
      message: "Erreur lors du marquage hors ligne",
      error: error.message
    });
  }
};

/**
 * @desc    Marquer un utilisateur comme inactif
 * @method  POST
 * @route   /messages/online-status/inactive
 */
const markUserInactive = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    const updatedUser = await setUserInactive(Number(userId));

    // Notifier les autres utilisateurs du changement de statut
    req.io.emit('userStatusChanged', {
      userId: updatedUser.id,
      status: 'INACTIF',
      user: {
        id: updatedUser.id,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom
      }
    });

    res.status(200).json({
      message: "Utilisateur marqué comme inactif",
      data: updatedUser
    });
  } catch (error) {
    console.error("Erreur lors du marquage inactif:", error);
    res.status(500).json({
      message: "Erreur lors du marquage inactif",
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer le statut en ligne de tous les utilisateurs
 * @method  GET
 * @route   /messages/online-status/users
 */
const getUsersOnlineStatus = async (req, res) => {
  try {
    const users = await getAllUsersOnlineStatus();
    res.status(200).json({
      message: "Statuts en ligne récupérés avec succès",
      data: users
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statuts:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des statuts",
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour la dernière activité d'un utilisateur
 * @method  POST
 * @route   /messages/online-status/activity
 */
const updateUserActivity = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "ID de l'utilisateur manquant"
      });
    }

    const updatedUser = await updateLastActivity(Number(userId));

    res.status(200).json({
      message: "Activité mise à jour avec succès",
      data: updatedUser
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'activité:", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'activité",
      error: error.message
    });
  }
};

export {
  markUserOnline,
  markUserOffline,
  markUserInactive,
  getUsersOnlineStatus,
  updateUserActivity
}; 