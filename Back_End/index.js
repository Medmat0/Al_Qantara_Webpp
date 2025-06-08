import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import revuesRoutes from './src/routes/revues.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import userRoutes from './src/routes/user.routes.js';
import cors from "cors";
import evenementsRoutes from './src/routes/evenements.routes.js';
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import offresRoutes from './src/routes/offres.routes.js';
import helmet from "helmet";

const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sécurité supplémentaire
app.use(helmet());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/revues", revuesRoutes);
app.use("/admin", adminRoutes);
app.use("/evenements", evenementsRoutes);
app.use("/offres", offresRoutes);
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});