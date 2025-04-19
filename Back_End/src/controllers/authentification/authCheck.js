import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "../../utils/token.js";
import {refreshAccessToken} from "./refreshAccessToken.js";

const prisma = new PrismaClient();

/**
 * @desc    Check authentication status
 * @method  GET
 * @route   /auth/auth-check
 * @access  public
 */
export const checkAuthStatus = asyncHandler(async (req, res) => {

    const accessToken = req.cookies["accessToken"]; // Retrieve the access token from cookies
    const refreshToken = req.cookies["refreshToken"]; // Retrieve the refresh token from cookies

    if (!accessToken && !refreshToken) {
        return res.status(200).json({ authenticated: false, message: "User not authenticated" });
    }


    try {
        const decodedToken = await verifyAccessToken(accessToken); // Verify the token
        const user = await prisma.utilisateur.findUnique({ where: { id: decodedToken.id } });

        if(!accessToken && refreshToken) {
            res.status(401).json({ authenticated: false, message: "Access token expired"});
        }

        if (!user) {
            return res.status(200).json({ authenticated: false, message: "User not found" });
        }
        res.status(200).json({
            authenticated: true,
            utilisateur: user,
        });
    } catch (error) {
        res.status(200).json({ authenticated: false, message: "Invalid or expired token" });
    }
});