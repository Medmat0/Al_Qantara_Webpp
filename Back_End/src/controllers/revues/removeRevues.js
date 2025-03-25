
/**
 * @desc    Supprimer une revue (Admin uniquement)
 * @method  DELETE
 * @route   /revues/:id
 */
const deleteRevue = async (req, res) => {
    try {
      const { id } = req.params;
  
      const revue = await prisma.revue.findUnique({ where: { id: parseInt(id) } });
      if (!revue) {
        return res.status(404).json({ message: "Revue non trouvée." });
      }
  
      const publicId = revue.document.split("/").pop().split(".")[0]; 
      await cloudinary.uploader.destroy(`revues/${publicId}`);
  
      await prisma.revue.delete({ where: { id: parseInt(id) } });
  
      res.status(200).json({ message: "Revue supprimée avec succès." });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
  };

 export {deleteRevue}
  