# OCHO - Gestion de Stock

Une application complète de gestion de stock avec interface web et API REST.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 14+ installé
- MySQL/XAMPP en fonctionnement
- npm ou yarn

### 1. Installation

#### Backend
```bash
cd backend
npm install
```

#### Frontend
Aucune installation requise - fichiers statiques uniquement.

### 2. Configuration Base de Données

1. Ouvrir phpMyAdmin (http://localhost/phpmyadmin)
2. Créer une nouvelle base de données: `ocho_db`
3. Importer le fichier SQL:
   - Cliquez sur l'onglet "Importer"
   - Sélectionnez `backend/config/init.sql`
   - Cliquez sur "Exécuter"

**OU** via ligne de commande MySQL:
```bash
mysql -u root -p < backend/config/init.sql
```

### 3. Configuration Environnement

Le fichier `.env` est déjà configuré avec les valeurs par défaut:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ocho_db
DB_PORT=3306
JWT_SECRET=ocho_secret_jwt_2026_change_me_in_production
JWT_EXPIRE=24h
```

**À faire avant la production:**
- Changer `JWT_SECRET` par une valeur sécurisée
- Définir un mot de passe MySQL pour l'utilisateur root
- Mettre `NODE_ENV=production`

### 4. Démarrage du Serveur

```bash
cd backend
npm start
```

Ou en mode développement avec auto-reload:
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3000`

### 5. Accéder à l'Application

Frontend: `http://localhost/OCHO/frontend/` (ou ouvrir index.html)

## 📝 Identifiants par Défaut

```
Email: admin@ocho.com
Mot de passe: admin123
Rôle: Administrateur
```

## 🔗 API Endpoints

### Authentification
- **POST** `/api/auth/login` - Connexion
- **POST** `/api/auth/register` - Inscription
- **GET** `/api/auth/verify` - Vérifier le token (authentification requise)

### Produits
- **GET** `/api/products` - Lister les produits
- **GET** `/api/products/:id` - Détails d'un produit
- **POST** `/api/products` - Créer un produit (Administrateur/Magasinier)
- **PUT** `/api/products/:id` - Modifier un produit (Administrateur/Magasinier)
- **DELETE** `/api/products/:id` - Supprimer un produit (Administrateur)
- **GET** `/api/products/categories/all` - Lister les catégories

### Clients
- **GET** `/api/clients` - Lister les clients
- **GET** `/api/clients/:id` - Détails d'un client
- **POST** `/api/clients` - Créer un client
- **PUT** `/api/clients/:id` - Modifier un client
- **DELETE** `/api/clients/:id` - Supprimer un client

### Commandes
- **GET** `/api/commandes` - Lister les commandes
- **GET** `/api/commandes/:id` - Détails d'une commande
- **POST** `/api/commandes` - Créer une commande
- **PUT** `/api/commandes/:id/valider` - Valider une commande
- **PUT** `/api/commandes/:id/statut` - Modifier le statut

### Tableau de Bord
- **GET** `/api/dashboard/stats` - Statistiques générales
- **GET** `/api/dashboard/alertes` - Lister les alertes

## 🧪 Test de Connexion BD

```bash
curl http://localhost:3000/api/test-db
```

Vous devriez recevoir une réponse confirmant la connexion.

## 📂 Structure du Projet

```
OCHO/
├── backend/
│   ├── config/
│   │   ├── database.js       # Configuration MySQL
│   │   └── init.sql          # Schéma base de données
│   ├── controllers/           # Logique métier
│   ├── middleware/            # Authentification & rôles
│   ├── routes/                # Définition des routes
│   ├── server.js              # Point d'entrée
│   ├── package.json
│   └── .env                   # Variables d'environnement
│
└── frontend/
    ├── index.html             # Page de connexion
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── api.js             # Client HTTP
    │   └── auth.js            # Gestion authentification
    ├── assets/
    └── pages/                 # Pages du dashboard
```

## 🔐 Rôles et Permissions

| Rôle | Lectures | Écritures | Suppressions |
|------|----------|-----------|-------------|
| Administrateur | ✅ Tout | ✅ Tout | ✅ Tout |
| Magasinier | ✅ Tout | ✅ Produits | ❌ |
| Vendeur | ✅ Tout | ✅ Commandes | ❌ |

## ⚠️ Problèmes Courants

### "Token manquant"
Vous devez d'abord vous connecter via `/api/auth/login` pour obtenir un token.

### "Erreur connexion DB"
- Vérifier que MySQL est actif
- Vérifier les paramètres `.env`
- Vérifier que la base `ocho_db` existe

### Port 3000 déjà utilisé
Modifier le port dans `.env`:
```
PORT=3001
```

## 📦 Dépendances Backend

- `express` - Framework web
- `mysql2/promise` - Client MySQL asynchrone
- `bcrypt` - Hash de mots de passe
- `jsonwebtoken` - Tokens JWT
- `dotenv` - Variables d'environnement
- `cors` - Cross-Origin Resource Sharing

## 🚀 Déploiement

Avant de mettre en production:

1. ✅ Mettre à jour `JWT_SECRET` dans `.env`
2. ✅ Configurer les informations d'identification MySQL
3. ✅ Ajouter un `.gitignore` pour le fichier `.env`
4. ✅ Mettre `NODE_ENV=production`
5. ✅ Utiliser un certificat SSL/HTTPS
6. ✅ Configurer CORS correctement (pas `*`)

## 📧 Support

Pour toute question ou bug, créer un issue dans le repository.
