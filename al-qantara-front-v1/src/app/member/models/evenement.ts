// evenement.model.ts
export type TypeEvenement = 'INTERNE' | 'EXTERNE';
export type StatutParticipation = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';

export interface Evenement {
  id: number;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  type: TypeEvenement;
  createdBy: number;
  images: string[];
  video?: string;
  latitude?: number;
  longitude?: number;
  placesTotal?: number;
  placesRestantes?: number;
  likes?: LikeEvenement[];
  comments?: CommentaireEvenement[];
  ratings?: RatingEvenement[];
  partages?: PartageEvenement[];
  participations?: ParticipationEvenement[];
  acces?: AccesEvenement[];
}


export interface LikeEvenement {
  id: number;
  evenementId: number;
  utilisateurId: number| null ;
  dateLike: string;
}

export interface CommentaireEvenement {
  id: number;
  evenementId: number;
  utilisateurId: number;
  contenu: string;
  dateCommentaire: string;
}

export interface RatingEvenement {
  id: number;
  evenementId: number;
  utilisateurId: number;
  noteOrganisateur: number;
  noteLieu: number;
  noteAmbiance: number;
  noteEvenement: number;
  commentaire?: string;
  dateRating: string;
}

// partage-evenement.model.ts
export interface PartageEvenement {
  id: number;
  evenementId: number;
  utilisateurId: number;
  emailDestinataire: string;
  message?: string;
  datePartage: string;
}


export interface ParticipationEvenement {
  id: number;
  evenementId: number;
  utilisateurId: number;
  statut: StatutParticipation;
  qrCode?: string;
  dateParticipation: string;
}


export interface AccesEvenement {
  id: number;
  evenementId: number;
  utilisateurId: number;
}
