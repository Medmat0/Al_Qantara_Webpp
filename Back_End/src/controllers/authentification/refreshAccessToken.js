import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { createAccessToken } from "../../utils/token.js";

const prisma = new PrismaClient();

/**
 * @desc    Refresh the access token
 * @method  POST
 * @route   /auth/refresh-accesstoken
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is missing" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await prisma.utilisateur.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newAccessToken = createAccessToken(user.id);

        // Send the new access token to the client
        res.cookie("accessToken", newAccessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            sameSite: "None",
            secure: true, // Uncomment in production
        });

        res.status(200).json({ message: "Access token refreshed" });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
});

export { refreshAccessToken };