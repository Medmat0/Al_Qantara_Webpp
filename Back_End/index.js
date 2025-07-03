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
import { setUserOnline, setUserOffline, cleanupInactiveUsers } from './src/services/messagerie/onlineStatusService.js';
import newsletterRoutes from './src/routes/newsletter.routes.js';
import adhesionRoutes from './src/routes/adhesion.routes.js';

import bodyParser from "body-parser";
import helmet from "helmet";
import communityRoutes from "./src/routes/community.routes.js";

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONT_URL || "http://localhost:4200",
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
  socket.on('authenticate', async (userId) => {
    try {
      userSockets.set(userId, socket.id);
      
      // Marquer l'utilisateur comme en ligne
      const updatedUser = await setUserOnline(userId);
      
      // Notifier les autres utilisateurs
      socket.broadcast.emit('userStatusChanged', {
        userId: updatedUser.id,
        status: 'EN_LIGNE',
        user: {
          id: updatedUser.id,
          nom: updatedUser.nom,
          prenom: updatedUser.prenom
        }
      });
      
      console.log(`Utilisateur ${userId} authentifié et marqué comme en ligne`);
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
    }
  });

  // Mise à jour de l'activité utilisateur
  socket.on('userActivity', async (userId) => {
    try {
      // Ici on pourrait mettre à jour la dernière activité
      // mais pour l'instant on garde juste la connexion active
      console.log(`Activité utilisateur ${userId} mise à jour`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
    }
  });

  // Déconnexion
  socket.on('disconnect', async () => {
    try {
      let disconnectedUserId = null;
      
      // Trouver l'utilisateur déconnecté
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        // Marquer l'utilisateur comme hors ligne
        const updatedUser = await setUserOffline(disconnectedUserId);
        
        // Notifier les autres utilisateurs
        socket.broadcast.emit('userStatusChanged', {
          userId: updatedUser.id,
          status: 'HORS_LIGNE',
          user: {
            id: updatedUser.id,
            nom: updatedUser.nom,
            prenom: updatedUser.prenom
          }
        });
        
        console.log(`Utilisateur ${disconnectedUserId} déconnecté et marqué comme hors ligne`);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  });
});

// Nettoyage automatique des utilisateurs inactifs toutes les 5 minutes
setInterval(async () => {
  try {
    const cleanedCount = await cleanupInactiveUsers();
    if (cleanedCount > 0) {
      console.log(`${cleanedCount} utilisateurs inactifs nettoyés`);
      
      // Notifier tous les clients du nettoyage
      io.emit('inactiveUsersCleaned', { count: cleanedCount });
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des utilisateurs inactifs:', error);
  }
}, 5 * 60 * 1000); // 5 minutes

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
  origin: ["http://localhost:4200", "https://23a8-2a02-8428-8533-ea01-b80f-a38f-e50b-d6af.ngrok-free.app", process.env.FRONT_URL].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
//app.use(bodyParser.json()); ----------------- a decommenter si on utilise bodyParser-----
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Pour form-data et x-www-form-urlencoded

// Servir les fichiers statiques du dossier uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/revues", revuesRoutes);
app.use("/articles", articleRoutes);
app.use("/admin", adminRoutes);
app.use("/evenements", evenementsRoutes);
app.use("/offres", offresRoutes);
app.use("/user", userRoutes);
app.use("/messages", messagerieRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/adhesion", adhesionRoutes);
app.use("/communities", communityRoutes);

// Démarrer le serveur avec Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});