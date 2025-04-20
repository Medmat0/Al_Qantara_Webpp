import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import { verifyAccessToken } from "../utils/token.js";

const prisma = new PrismaClient();

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies["accessToken"]; // Extract token from cookies
  if (!token) return res.status(401).json({ message: "Access token not found in cookies" });

  const decodedToken = await verifyAccessToken(token);
  const user = await prisma.utilisateur.findUnique({ where: { id: decodedToken.id } });
  if (!user) return res.status(403).json({ message: "User not allowed" });

  req.user = user; // Attach user to the request object
  next();
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies["accessToken"]; // Extract token from cookies
  if (!token) return res.status(401).json({ message: "Access token not found in cookies" });

  const decodedToken = await verifyAccessToken(token);
  const user = await prisma.utilisateur.findUnique({ where: { id: decodedToken.id } });
  if (!user) return res.status(403).json({ message: "User not allowed" });

  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "You are not admin" });
  }

  req.user = user; // Attach user to the request object
  next();
});

export { authMiddleware, isAdmin };