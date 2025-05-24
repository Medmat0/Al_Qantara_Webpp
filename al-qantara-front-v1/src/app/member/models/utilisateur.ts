import {Revue} from './revue';
import {
  AccesEvenement,
  CommentaireEvenement,
  Evenement,
  LikeEvenement,
  PartageEvenement, ParticipationEvenement,
  RatingEvenement
} from './evenement';
import {Adhesion} from './adhesion';
import {Article} from './article';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: Role;
  dateInscription: string; // ISO string
  statut: Statut;
  emailVerificationToken?: string;
  emailVerified: boolean;
  passwordResetToken?: string;
  passwordResetTokenExpire?: string;
  evenements?: Evenement[];
  revues?: Revue[];
  articles?: Article[];
  adhesion?: Adhesion;
  accesEvenements?: AccesEvenement[];
  likes?: LikeEvenement[];
  commentaires?: CommentaireEvenement[];
  ratings?: RatingEvenement[];
  partages?: PartageEvenement[];
  participations?: ParticipationEvenement[];
}

export type Role = 'ADMIN' | 'ADHERENT' | 'USER';
export type Statut = 'ACTIF' | 'INACTIF';
