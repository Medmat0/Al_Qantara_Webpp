export type TypeContrat = 'CDI' | 'CDD' | 'FREELANCE' | 'STAGE' | 'ALTERNANCE' | 'INTERIM' | 'APPRENTISSAGE' | 'BENEVOLAT';

export interface Offre {
  id: number;
  titre: string;
  description: string;
  tags: string[];
  lieuDeTravail: string;
  typeDeContrat: TypeContrat;
  dateDebut: string; // ISO 8601
  datePublication: string;
}
