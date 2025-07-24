# Al Qantara - Plateforme Communautaire Marocaine

[<span style="color:\#1976d2;font-weight:bold;">alqantara.fr</span>](https://alqantara.fr)
## 📋 Description

Al Qantara est une plateforme web dédiée à la communauté marocaine, offrant un espace numérique pour découvrir, partager et préserver le patrimoine culturel du Maroc. La plateforme propose des articles, des guides, un annuaire d'associations, des événements et bien plus encore.

## 🏗️ Architecture du Projet

Le projet est structuré en deux parties principales :

```
Al_Qantara_Webpp/
├── al-qantara-front-v1/    # Frontend Angular
├── Back_End/               # Backend Node.js/Express
├── package.json           # Dépendances racine
└── Dockerfile            # Configuration Docker
```

## 🛠️ Technologies Utilisées

### Frontend
- **Angular 19.2.0** - Framework principal
- **TypeScript** - Langage de programmation
- **SCSS** - Préprocesseur CSS
- **Leaflet** - Cartes interactives

### Backend
- **Node.js** - Environnement d'exécution
- **Express.js** - Framework web
- **Prisma** - ORM base de données
- **Socket.io** - Communication temps réel
- **JWT** - Authentification
- **Cloudinary** - Gestion des médias
- **Nodemailer** - Envoi d'emails
- **bcrypt** - Chiffrement des mots de passe

### Base de Données
- **PostgreSQL** (via Prisma)

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- PostgreSQL
- Compte Cloudinary (pour les médias)

### Installation

1. **Cloner le repository**
```bash
git clone <url-du-repository>
cd Al_Qantara_Webpp
```

2. **Configuration du Backend**
```bash
cd Back_End
npm install
```

3. **Configuration des variables d'environnement**
Créer un fichier `.env` dans le dossier `Back_End` :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/alqantara_db"
JWT_SECRET="votre_jwt_secret"
CLOUDINARY_CLOUD_NAME="votre_cloud_name"
CLOUDINARY_API_KEY="votre_api_key"
CLOUDINARY_API_SECRET="votre_api_secret"
EMAIL_USER="votre_email"
EMAIL_PASS="votre_mot_de_passe_email"
```

4. **Initialiser la base de données**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Configuration du Frontend**
```bash
cd ../al-qantara-front-v1
npm install
```

## 🏃‍♂️ Démarrage

### Développement

1. **Démarrer le backend**
```bash
cd Back_End
node .\index.js```
```
Le serveur sera accessible sur `http://localhost:3000`

2. **Démarrer le frontend**
```bash
cd al-qantara-front-v1
npm start
```
L'application sera accessible sur `http://localhost:4200`

### Production avec Docker

```bash
docker-compose up --build
```

## 📁 Structure des Dossiers

### Frontend (`al-qantara-front-v1/`)
```
src/
├── app/
│   ├── admin/              # Module administrateur
│   ├── components/         # Composants réutilisables
│   ├── guards/            # Guards de routing
│   ├── member/            # Module membres
│   ├── pages/             # Pages principales
│   ├── services/          # Services Angular
│   └── utils/             # Utilitaires
├── assets/                # Ressources statiques
└── styles/                # Styles globaux
```

### Backend (`Back_End/`)
```
src/
├── controllers/           # Logique métier
├── middleware/           # Middlewares Express
├── routes/              # Définition des routes
├── services/            # Services backend
└── utils/               # Utilitaires
prisma/
├── schema.prisma        # Schéma de base de données
└── migrations/          # Migrations
```

## 🌟 Fonctionnalités Principales

### 🔐 Authentification
- Inscription/Connexion
- Gestion des rôles (Admin, Membre)
- Réinitialisation de mot de passe
- Vérification email

### 📰 Gestion de Contenu
- Articles sur la culture marocaine
- Revues numériques
- Guides touristiques
- Gestion des catégories

### 🏢 Annuaire d'Associations
- Répertoire des associations marocaines
- Profils détaillés
- Géolocalisation
- Recherche avancée

### 📅 Événements
- Calendrier interactif
- Création et gestion d'événements
- Notifications
- Planification de réunions

### 💬 Messagerie
- Chat en temps réel
- Notifications push
- Historique des conversations

### 🗺️ Cartographie
- Cartes interactives avec Leaflet
- Points d'intérêt culturels



## 🔧 Scripts Disponibles

### Frontend
- `npm start` - Démarrage en mode développement
- `npm run build` - Build de production

### Backend
- `npm start` - Démarrage du serveur



## 🔒 Sécurité

- Authentification JWT
- Validation des données côté serveur
- Protection CORS
- Helmet.js pour les headers de sécurité
- Chiffrement bcrypt pour les mots de passe



---

**Al Qantara** - Connecter la communauté marocaine à travers le numérique 🇲🇦
