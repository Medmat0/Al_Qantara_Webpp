import {Utilisateur} from './utilisateur';

export interface Revue {
  id: number;
  titre: string;
  description: string;
  mois: string;
  annee: string;
  fichier: string;
  datePublication: string;
  nombreVues: number;
  nombreTelechargements: number;
  createdBy: number;
}

export interface Article {
  id: number;
  titre: string;
  contenu: string;
  auteur: string;
  dateSoumission: string;
  revueId?: number;
  revue?: {
    id: number;
    titre: string;
    description: string;
    mois: string;
    annee: string;
    fichier: string;
    datePublication: string;
    nombreVues: number;
    nombreTelechargements: number;
    createdBy: number;
  };
  createur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    photoProfil?: string | null;
    role: string;
  };
  categories?: { id: number; nom: string; description?: string }[];
}

export type StatutArticle = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
