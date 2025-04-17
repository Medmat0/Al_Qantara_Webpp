import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "../../utils/token.js";

const prisma = new PrismaClient();

/**
 * @desc    Check authentication status
 * @method  GET
 * @route   /auth/auth-check
 * @access  public
 */
export const checkAuthStatus = asyncHandler(async (req, res) => {
    console.log("Cookies:", req.cookies["accessToken"]); // Log cookies for debugging

    const accessToken  = req.cookies["accessToken"]; // Retrieve the access token from cookies

    if (!accessToken) {
        console.log("No access token found");
        return res.status(401).json({ authenticated: false, message: "Not authenticated" });
    }

    try {
        const decodedToken = await verifyAccessToken(accessToken); // Verify the token
        const user = await prisma.utilisateur.findUnique({ where: { id: decodedToken.id } });

        if (!user) {
            return res.status(401).json({ authenticated: false, message: "User not found" });
        }

        res.status(200).json({
            authenticated: true,
            utilisateur: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(401).json({ authenticated: false, message: "Invalid or expired token" });
    }
});

