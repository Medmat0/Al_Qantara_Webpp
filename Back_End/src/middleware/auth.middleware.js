import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { verifyAccessToken } from "../utils/token.js";
import { ROLES } from "../utils/role.enum.js";

const prisma = new PrismaClient();

const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies["accessToken"];
    if (!token) {
      return res.status(401).json({ message: "Access token not found in cookies" });
    }

    const decodedToken = await verifyAccessToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await prisma.utilisateur.findUnique({ 
      where: { id: decodedToken.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
});

export { authMiddleware, isAdmin };