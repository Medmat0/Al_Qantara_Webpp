import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createRemboursementDemande = async (utilisateurId, evenementId, raison) => {
  return prisma.remboursementDemande.create({
    data: {
      utilisateurId,
      evenementId,
      status: 'en_attente',
      raison
    }
  });
};

export const listRemboursementDemandes = async () => {
  return prisma.remboursementDemande.findMany({
    include: {
      // Si tu veux les infos utilisateur et événement, adapte selon tes modèles
       utilisateur: true,
       evenement: true
    }
  });
};

export const updateRemboursementDemandeStatus = async (id, status) => {
  return prisma.remboursementDemande.update({
    where: { id },
    data: { status }
  });
}; 