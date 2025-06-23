
const promoteMember = async (req, res) => {
    try {
        const updatedCommunity = await promoteMemberService(req);
        res.status(200).json({
            message: updatedCommunity
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Erreur lors de la promotion du membre."
        });
    }
}

export { promoteMember };