import asyncHandler from "express-async-handler";
import {verifyAccessToken} from "../../utils/token.js";
import  {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();
/**
 * @desc    Verify if user is admin
 * @method  GET
 * @route   /auth/admin-check
 * @access  public
 */
const adminCheck = asyncHandler(async (req,res,next)=>{
   const accessToken = req.cookies["accessToken"];

    if (!accessToken) return res.status(401).json({ authorized:false, message: "Access token not found in cookies" });

    const decodedToken = await verifyAccessToken(accessToken);

    const user = await prisma.utilisateur.findUnique({ where: { id: decodedToken.id } });
    if (!user) return res.status(403).json({ message: "User not allowed" });

    if (user.role !== "ADMIN") {
        return res.status(403).json({ authorized:false, message: "You are not admin." });
    }

    return res.status(200).json({ authorized : true, message:"Account authorized."})


});

export {adminCheck};