const getCandidatureById = async (req, res) => {
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

        return res.status(200).json(candidature);

    } catch (error) {
        console.error("Erreur lors de la récupération de la candidature:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération de la candidature.",
            error: error.message,
        });
    }
}

const getAllCandidaturesByUserId = async (req, res) => {
    const userId = req.user?.id; // Nécessite que authMiddleware ajoute l'ID utilisateur à req.user

    try {
        // Récupérer toutes les candidatures de l'utilisateur
        const candidatures = await prisma.candidature.findMany({
            where: { utilisateurId: userId },
            include: { offre: true }
        });

        if (!candidatures || candidatures.length === 0) {
            return res.status(404).json({ message: "Aucune candidature trouvée pour cet utilisateur." });
        }

        return res.status(200).json(candidatures);

    } catch (error) {
        console.error("Erreur lors de la récupération des candidatures:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des candidatures.",
            error: error.message,
        });
    }
}

const getAllCandidaturesByOfferId = async (req, res) => {
    const { offerId } = req.params; // ID de l'offre

    try {
        // Récupérer toutes les candidatures pour l'offre
        const candidatures = await prisma.candidature.findMany({
            where: { offreId: parseInt(offerId) },
            include: { utilisateur: true }
        });

        if (!candidatures || candidatures.length === 0) {
            return res.status(404).json({ message: "Aucune candidature trouvée pour cette offre." });
        }

        return res.status(200).json(candidatures);

    } catch (error) {
        console.error("Erreur lors de la récupération des candidatures pour l'offre:", error);
        res.status(500).json({
            message: "Erreur lors de la récupération des candidatures pour l'offre.",
            error: error.message,
        });
    }
}