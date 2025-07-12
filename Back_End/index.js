import express from "express";
import annuaireRoutes from './src/routes/annuaire.routes.js';
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
import socketAuthMiddleware from "./src/middleware/socketAuth.middleware.js";

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

io.use(socketAuthMiddleware);

// Stockage des connexions utilisateurs
const userSockets = new Map();

// Gestion des connexions Socket.IO
io.on('connection', async (socket) => {
  const user = socket.user;
  console.log(`Utilisateur connecté : ${user.nom} ${user.prenom}`);

  userSockets.set(user.id, socket.id);

  const updatedUser = await setUserOnline(user.id);

  socket.broadcast.emit('userStatusChanged', {
    userId: updatedUser.id,
    status: 'EN_LIGNE',
    user: {
      id: updatedUser.id,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom
    }
  });

  // Mise à jour de l'activité utilisateur
  socket.on('userActivity', async () => {
    try {
      console.log(`Activité utilisateur ${user.id} mise à jour`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
    }
  });

  // Déconnexion
  socket.on('disconnect', async () => {
    try {
      userSockets.delete(user.id);
      const updatedUser = await setUserOffline(user.id);

      socket.broadcast.emit('userStatusChanged', {
        userId: updatedUser.id,
        status: 'HORS_LIGNE',
        user: {
          id: updatedUser.id,
          nom: updatedUser.nom,
          prenom: updatedUser.prenom
        }
      });

      console.log(`Utilisateur ${user.id} déconnecté et marqué comme hors ligne`);
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
      io.emit('inactiveUsersCleaned', { count: cleanedCount });
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des utilisateurs inactifs:', error);
  }
}, 5 * 60 * 1000);

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
  origin: process.env.FRONT_URL || "http://localhost:4200",
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
app.use("/annuaire", annuaireRoutes);

// Démarrer le serveur avec Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});