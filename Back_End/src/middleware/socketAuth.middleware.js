import cookie from "cookie";
import { verifyAccessToken } from "../utils/token.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookies = socket.handshake.headers.cookie;
        if (!cookies) {
            return next(new Error("No cookies found"));
        }

        const parsedCookies = cookie.parse(cookies);
        const token = parsedCookies.accessToken;

        if (!token) {
            return next(new Error("Access token not found"));
        }

        const decoded = await verifyAccessToken(token);
        if (!decoded) {
            return next(new Error("Invalid token"));
        }

        const user = await prisma.utilisateur.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.user = user;
        next();
    } catch (err) {
        console.error("Socket auth error:", err);
        next(new Error("Authentication failed"));
    }
};

export default socketAuthMiddleware;
