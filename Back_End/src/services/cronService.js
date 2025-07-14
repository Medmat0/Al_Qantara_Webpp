import cron from 'node-cron';
import { processRatingReminders } from '../services/evenements/ratingReminderService.js';

/**
 * @desc Service de gestion des tâches automatiques programmées
 */

/**
 * Initialiser tous les cron jobs
 */
export const initializeCronJobs = () => {
  console.log(' Initialisation des tâches automatiques programmées...');

  // Vérification toutes les 2 minutes pour les rappels de rating
  cron.schedule('*/2 * * * *', async () => {
    try {
      const result = await processRatingReminders();
      if (result.emailsSent > 0) {
        console.log(` ${result.emailsSent} email(s) de rappel envoyé(s)`);
      }
    } catch (error) {
      console.error('Erreur lors du processus de rappels de rating:', error);
    }
  }, {
    scheduled: true,
    timezone: "Europe/Paris"
  });

  console.log('✅ Tâche automatique programmée: vérification toutes les 2 minutes');
};

/**
 * Exécuter manuellement le processus de rappels de rating
 * Utile pour les tests ou l'exécution manuelle
 */


/**
 * Arrêter toutes les tâches programmées
 */
export const stopAllCronJobs = () => {
  cron.destroy();
};

/**
 * Obtenir le statut des tâches programmées
 */
export const getCronJobsStatus = () => {
  const tasks = cron.getTasks();
  return {
    totalTasks: tasks.size,
    tasks: Array.from(tasks.entries()).map(([key, task]) => ({
      id: key,
      running: task.running,
      scheduled: task.scheduled
    }))
  };
};
