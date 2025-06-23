import {addVoteToPollService} from "../../services/community/communityPost.service.js";


const addVoteToPoll = async (req, res) => {
    try{
        const modifiedPost = await addVoteToPollService(req);
        res.status(200).json({
            message: "Vote added successfully.",
            post: modifiedPost
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "Error adding vote to poll.",
        });
    }
}

export { addVoteToPoll };
