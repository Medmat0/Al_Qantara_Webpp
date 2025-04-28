import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
/**
 * @desc    Ajouter vue pour chaque revue 
 * @method  GET
 * @route   /revues/:id/view
 */


const incrementVue = async (req, res) => {
  const revueId = parseInt(req.params.id);

  try {
    const revue = await prisma.revue.findUnique({
      where: { id: revueId },
    });

    if (!revue) {
      return res.status(404).json({ message: "Revue non trouvée" });
    }

    await prisma.revue.update({
      where: { id: revueId },
      data: {
        nombreVues: { increment: 1 },
      },
    });

    res.status(200).json({ message: "Vue enregistrée" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'incrémentation des vues", error: err.message });
  }
};


  /**
 * @desc    Ajouter telechargement pour chaque revue 
 * @method  GET
 * @route   /revues/:id/download
 */


  const incrementTelechargement = async (req, res) => {
    const revueId = parseInt(req.params.id);
    try {
      const revue = await prisma.revue.findUnique({
        where: { id: revueId },
      });
  
      if (!revue) {
        return res.status(404).json({ message: "Revue non trouvée" });
      }
      
    
      await prisma.revue.update({
        where: { id: revueId },
        data: {
          nombreTelechargements: { increment: 1 }
        }
      });
      res.status(200).json({ message: "Téléchargement enregistré" });
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de l'incrémentation des téléchargements", error: err.message });
    }
  };
  
  
export { incrementVue , incrementTelechargement}