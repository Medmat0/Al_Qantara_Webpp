import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./src/routes/auth.routes.js";
import revuesRoutes from './src/routes/revues.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import userRoutes from './src/routes/user.routes.js';
import cors from "cors";
import evenementsRoutes from './src/routes/evenements.routes.js';
import articleRoutes from './src/routes/article.routes.js';
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import offresRoutes from './src/routes/offres.routes.js';
import messagerieRoutes from './src/routes/messagerie.routes.js';

import bodyParser from "body-parser";
import helmet from "helmet";

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Stockage des connexions utilisateurs
const userSockets = new Map();

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté');

  // Authentification de l'utilisateur
  socket.on('authenticate', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`Utilisateur ${userId} authentifié`);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`Utilisateur ${userId} déconnecté`);
        break;
      }
    }
  });
});

// Middleware pour rendre io accessible dans les routes
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// donne une sécurité supplémentaire à l'application backend
app.use(helmet());
app.use(cookieParser());
// A voir si on en a besoin
/*
// Configure une CSP personnalisée
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],         // Seul ton domaine peut tout charger
      scriptSrc: ["'self'"],          // Bloque scripts externes
      styleSrc: ["'self'", 'https:'], // Permet les styles (ex: Google Fonts)
      imgSrc: ["'self'", 'data:'],    // Images du domaine + base64
      connectSrc: ["'self'"],         // API same origin
      fontSrc: ["'self'", 'https:'],  // Polices (ex: Google Fonts)
      objectSrc: ["'none'"],          // Interdit les objets Flash/Java
      upgradeInsecureRequests: [],    // Force HTTPS
    },
  })
);
 */

app.use(cors({
  // Autorise les requêtes CORS seulement depuis le frontend
  origin: process.env.FRONT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json()); 
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Pour form-data et x-www-form-urlencoded

// Servir les fichiers statiques du dossier uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/revues", revuesRoutes);
app.use("/admin", adminRoutes);
app.use("/evenements", evenementsRoutes);
app.use("/offres", offresRoutes);
app.use("/user", userRoutes);
app.use("/messages", messagerieRoutes);

// Démarrer le serveur avec Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});