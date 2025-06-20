import {PrismaClient} from '@prisma/client';
import cloudinary from "../../config/cloudinary.js";

const prisma = new PrismaClient();


const createCommunityService = async(req,res) => {

    const { nom, description, logo } = req.body;
    const userId = req.user.id;

    const user = await prisma.utilisateur.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if(user.role!== "ADMIN" || user.role!== "ADHERENT" ){
        const err = new Error("Vous n'avez pas les droits nécessaires pour créer une communauté.");
        err.status = 403;
        throw err;
    }

    // Upload image to Cloudinary
    let imageUrl = null;
    if (logo) {
        const uploadResult = await cloudinary.uploader.upload(logo, {
            folder: 'communities',
            resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
    }


    const newCommunity = await prisma.community.create({
        data: {
            nom,
            description,
            image: imageUrl,
            createdBy: userId
        }
    });

    return newCommunity;
}

export { createCommunityService };