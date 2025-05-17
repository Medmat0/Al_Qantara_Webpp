import express from "express";
import authRoutes from "./src/routes/auth.routes.js";  
import revuesRoutes from './src/routes/revues.routes.js';
import adminRoutes from './src/routes/admin.routes.js'
import cors from "cors";
import evenementsRoutes from './src/routes/evenements.routes.js';
import cookieParser from "cookie-parser";


import bodyParser from "body-parser";
import helmet from "helmet";
const PORT = process.env.PORT || 3000;
const app = express();

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
  origin: process.env.FRONT_URL,
  credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json()); 
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Pour form-data et x-www-form-urlencoded


app.use("/auth", authRoutes);
app.use("/revues", revuesRoutes);
app.use("/admin",adminRoutes);
app.use("/evenements", evenementsRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});