import {Utilisateur} from './utilisateur';

export interface Article {
  id: number;
  titre: string;
  contenu: string;
  auteur: string;
  dateSoumission: string; // ISO string
  statut: StatutArticle;
  createdBy: number;
  createur: Utilisateur;
}

export type StatutArticle = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
