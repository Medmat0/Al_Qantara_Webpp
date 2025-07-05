export interface Message{
  destinataireId: number;
  contenu: string;
  type: 'EVENEMENT' | 'TEXTE';
  evenementId?: number;
  piecesJointes?: string;
}
