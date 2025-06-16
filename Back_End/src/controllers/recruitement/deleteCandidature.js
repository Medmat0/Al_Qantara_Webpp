import { PrismaClient } from "@prisma/client";
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();

const deleteCandidature = async (req, res) => {
    const { candidatureId } = req.params; // ID de la candidature
    const userId = req.user?.id; // Nécessite que authMiddleware ajoute l'ID utilisateur à req.user

    try {
        // Récupérer la candidature et l'utilisateur lié
        const candidature = await prisma.candidature.findUnique({
            where: { id: parseInt(candidatureId) },
            include: { utilisateur: true }
        });

        if (!candidature) {
            return res.status(404).json({ message: "Candidature non trouvée." });
        }

        // Vérifier si l'utilisateur est ADMIN ou propriétaire de la candidature
        const user = await prisma.utilisateur.findUnique({
            where: { id: userId }
        });

        if (!user || (user.role !== "ADMIN" && candidature.utilisateurId !== userId)) {
            return res.status(403).json({ message: "Accès refusé." });
        }

        // Supprimer la candidature
        await prisma.candidature.delete({
            where: { id: parseInt(candidatureId) },
        });

        return res.status(200).json({ message: "Candidature supprimée avec succès." });

    } catch (error) {
        console.error("Erreur lors de la suppression de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de la suppression de la candidature.",
            error: error.message,
        });
    }
}

export { deleteCandidature };