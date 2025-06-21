import { createRemboursementDemande, listRemboursementDemandes, updateRemboursementDemandeStatus } from '../../services/evenements/remboursement.service.js';

export const demandeRemboursementController = async (req, res) => {
  try {
    const evenementId = parseInt(req.params.id);
    const utilisateurId = 4;
    //const utilisateurId = req.user.id; // À adapter selon ton auth
    const { raison } = req.body;
    console.log(raison);
    const demande = await createRemboursementDemande(utilisateurId, evenementId, raison);
    res.status(201).json(demande);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la demande de remboursement', error: error.message });
  }
};

export const listRemboursementDemandesController = async (req, res) => {
  try {
    const demandes = await listRemboursementDemandes();
    res.json(demandes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes', error: error.message });
  }
};

export const updateRemboursementDemandeStatusController = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!['en_attente', 'accepte', 'refuse', 'rembourse'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    const updated = await updateRemboursementDemandeStatus(id, status);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
  }
}; 