import {Utilisateur} from './utilisateur';

export interface Adhesion {
  id: number;
  utilisateur: Utilisateur;
  utilisateurId: number;
  dateDemande: string; // ISO string
  statut: StatutAdhesion;
}

export type StatutAdhesion = 'EN_ATTENTE' | 'ACCEPTE' | 'REJETE';
