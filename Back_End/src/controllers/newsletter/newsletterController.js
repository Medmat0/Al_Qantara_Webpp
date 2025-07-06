/**
 * Supprimer une newsletter (admin uniquement)
 * @route DELETE /newsletter/:newsletterId
 */
export const supprimerNewsletter = async (req, res) => {
  try {
    const { newsletterId } = req.params;
    if (!newsletterId) {
      return res.status(400).json({ message: "ID newsletter requis" });
    }
    await supprimerNewsletterService(newsletterId);
    res.status(200).json({ message: "Newsletter supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la newsletter:", error);
    res.status(500).json({ message: error.message || "Erreur lors de la suppression de la newsletter" });
  }
};

/**
 * Changer le statut d'une newsletter (admin uniquement)
 * @route PATCH /newsletter/:newsletterId/statut
 */
export const changerStatutNewsletter = async (req, res) => {
  try {
    const { newsletterId } = req.params;
    const { statut } = req.body;
    if (!newsletterId || !statut) {
      return res.status(400).json({ message: "ID newsletter et statut requis" });
    }
    const updated = await changerStatutNewsletterService(newsletterId, statut);
    res.status(200).json({ message: "Statut de la newsletter mis à jour", data: updated });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    res.status(500).json({ message: error.message || "Erreur lors du changement de statut" });
  }
};
import {
  ajouterAbonnementNewsletter,
  desinscrireNewsletter,
  envoyerNewsletter,
  getAbonnesNewsletter,
  getHistoriqueNewsletters,
  getAbonnementParUtilisateur
} from "../../services/newsletter/newsletterService.js";

/**
 * S'abonner à la newsletter
 * @route POST /newsletter/s-abonner
 */
export const sAbonnerNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "L'email est requis"
      });
    }

    const abonnement = await ajouterAbonnementNewsletter(email);
    
    res.status(201).json({
      message: "Inscription à la newsletter réussie",
      data: abonnement
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription à la newsletter:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de l'inscription à la newsletter"
    });
  }
};

/**
 * Envoyer une newsletter (admin uniquement)
 * @route POST /newsletter/envoyer
 */
export const envoyerNewsletterController = async (req, res) => {
  try {
    const { titre, contenu } = req.body;

    if (!titre || !contenu) {
      return res.status(400).json({
        message: "Le titre et le contenu sont requis"
      });
    }

    const resultat = await envoyerNewsletter(titre, contenu);
    
    res.status(200).json({
      message: "Newsletter envoyée avec succès",
      data: resultat
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la newsletter:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de l'envoi de la newsletter"
    });
  }
};

/**
 * Se désinscrire de la newsletter
 * @route DELETE /newsletter/desinscription/:utilisateurId
 */
export const seDesinscrireNewsletter = async (req, res) => {
  try {
    const { utilisateurId } = req.params;

    if (!utilisateurId) {
      return res.status(400).json({
        message: "ID utilisateur requis"
      });
    }

    await desinscrireNewsletter(utilisateurId);
    
    res.status(200).json({
      message: "Désinscription de la newsletter réussie"
    });
  } catch (error) {
    console.error("Erreur lors de la désinscription:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la désinscription"
    });
  }
};

/**
 * Vérifier le statut d'abonnement d'un utilisateur
 * @route GET /newsletter/statut/:utilisateurId
 */
export const getStatutAbonnement = async (req, res) => {
  try {
    const { utilisateurId } = req.params;

    if (!utilisateurId) {
      return res.status(400).json({
        message: "ID utilisateur requis"
      });
    }

    const abonnement = await getAbonnementParUtilisateur(utilisateurId);
    
    if (!abonnement) {
      return res.status(404).json({
        message: "Aucun abonnement trouvé pour cet utilisateur"
      });
    }

    res.status(200).json({
      message: "Statut d'abonnement récupéré avec succès",
      data: abonnement
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du statut:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la récupération du statut"
    });
  }
};

/**
 * Récupérer tous les abonnés (admin uniquement)
 * @route GET /newsletter/abonnes
 */
export const getAbonnesController = async (req, res) => {
  try {
    const abonnes = await getAbonnesNewsletter();
    
    res.status(200).json({
      message: "Liste des abonnés récupérée avec succès",
      data: abonnes
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des abonnés:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la récupération des abonnés"
    });
  }
};

/**
 * Récupérer l'historique des newsletters envoyées (admin uniquement)
 * @route GET /newsletter/historique
 */
export const getHistoriqueController = async (req, res) => {
  try {
    const historique = await getHistoriqueNewsletters();
    
    res.status(200).json({
      message: "Historique des newsletters récupéré avec succès",
      data: historique
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({
      message: error.message || "Erreur lors de la récupération de l'historique"
    });
  }
}; 