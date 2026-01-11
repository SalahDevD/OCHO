# 📚 DOCUMENTATION COMPLÈTE - OCHO

## 🎯 1. PRÉSENTATION DU PROJET

**OCHO** est une plateforme de gestion de stock et de commerce électronique conçue pour les PME dans le secteur textile/vêtements.

### Fonctionnalités Principales
- 🏪 Gestion des produits et du stock
- 👥 Gestion des clients
- 🛒 Panier d'achat et checkout
- 📦 Gestion des commandes
- 👤 Profils utilisateur avec bio et avatar
- 👨‍💼 Dashboard pour vendeurs (Employés)
- 📊 Statistiques et rapports
- 🔐 Système d'authentification JWT
- 🎭 Gestion des rôles et permissions

---

## 🗄️ 2. BASE DE DONNÉES

### Technologies
- **SGBD**: MySQL/MariaDB
- **Port**: 3306
- **Nom BD**: `ocho_db`

### Tables Principales

#### **Utilisateur**
```sql
CREATE TABLE Utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    avatar LONGTEXT,
    bio TEXT,
    actif BOOLEAN DEFAULT TRUE,
    derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(id)
);
```

#### **Role**
```sql
CREATE TABLE Role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) UNIQUE,
    description TEXT
);
```

**Rôles disponibles:**
- `Administrateur` - Accès complet
- `Magasinier` - Gestion des produits et stock
- `Employé` - Vendeur (vend ses propres produits)
- `Client` - Acheteur standard

#### **Produit**
```sql
CREATE TABLE Produit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    categorie_id INT NOT NULL,
    vendeur_id INT,
    genre ENUM('Homme', 'Femme', 'Enfant', 'Unisexe'),
    saison ENUM('Été', 'Hiver', 'Printemps', 'Automne', 'Toute saison'),
    marque VARCHAR(100),
    prix_achat DECIMAL(10, 2),
    prix_vente DECIMAL(10, 2),
    seuil_min INT DEFAULT 10,
    image_url VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categorie_id) REFERENCES Categorie(id),
    FOREIGN KEY (vendeur_id) REFERENCES Utilisateur(id)
);
```

#### **Commande**
```sql
CREATE TABLE Commande (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) UNIQUE,
    client_id INT,
    client_nom VARCHAR(150),
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    statut ENUM('Créée', 'Validée', 'Expédiée', 'Livrée', 'Annulée'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Utilisateur(id)
);
```

#### **Client**
```sql
CREATE TABLE Client (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Variante**
```sql
CREATE TABLE Variante (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    taille VARCHAR(20),
    couleur VARCHAR(50),
    quantite INT DEFAULT 0,
    FOREIGN KEY (produit_id) REFERENCES Produit(id)
);
```

#### **Categorie**
```sql
CREATE TABLE Categorie (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE
);
```

---

## 📁 3. STRUCTURE DES DOSSIERS

```
OCHO/
├── backend/
│   ├── config/
│   │   ├── database.js          # Configuration MySQL
│   │   └── init.sql             # Schéma de la BD
│   ├── controllers/
│   │   ├── authController.js    # Authentification & JWT
│   │   ├── userController.js    # Gestion utilisateurs
│   │   ├── productController.js # Gestion produits
│   │   ├── commandeController.js # Gestion commandes
│   │   ├── clientController.js  # Gestion clients
│   │   ├── dashboardController.js # Statistiques
│   ├── middleware/
│   │   ├── authMiddleware.js    # Vérification JWT
│   │   └── roleMiddleware.js    # Contrôle rôles
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── commandeRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── dashboardRoutes.js
│   ├── server.js                # Point d'entrée Express
│   └── package.json
│
├── frontend/
│   ├── pages/
│   │   ├── index.html           # Page login
│   │   ├── register.html        # Page inscription
│   │   ├── dashboard.html       # Dashboard admin
│   │   ├── profile.html         # Profil utilisateur
│   │   ├── products.html        # Gestion produits (Admin/Magasinier)
│   │   ├── seller-dashboard.html # Dashboard vendeur
│   │   ├── seller-products.html # Produits vendeur
│   │   ├── client-shop.html     # Boutique client
│   │   ├── commandes.html       # Commandes
│   │   ├── clients.html         # Gestion clients
│   │   ├── users.html           # Gestion utilisateurs
│   │   └── order-confirmation.html
│   ├── js/
│   │   ├── api.js               # Configuration API & navigation
│   │   ├── auth.js              # Fonctions authentification
│   │   ├── dashboard.js         # Logique dashboard admin
│   │   ├── profile.js           # Logique profil utilisateur
│   │   ├── products.js          # Logique produits admin
│   │   ├── seller-dashboard.js  # Logique dashboard vendeur
│   │   ├── seller-products.js   # Logique produits vendeur
│   │   ├── client-shop.js       # Logique boutique
│   │   ├── commandes.js         # Logique commandes
│   │   ├── clients.js           # Logique gestion clients
│   │   └── users.js             # Logique gestion utilisateurs
│   ├── css/
│   │   ├── dashboard.css        # Styles principaux
│   │   └── style.css            # Styles supplémentaires
│   └── assets/
│       └── images/
│
└── Documentation & Config
    ├── DOCUMENTATION_COMPLETE.md (ce fichier)
    ├── package.json
    └── init.sql
```

---

## 🔑 4. SYSTÈME D'AUTHENTIFICATION

### Flux d'authentification
1. **Login** → POST `/api/auth/login` → JWT Token + User Object
2. **Token stocké** → localStorage.token
3. **User info stocké** → localStorage.user
4. **Vérification** → authMiddleware sur chaque requête

### Contrôle d'accès par rôle
```javascript
// Administrateur
- Accès: Dashboard, Produits, Clients, Utilisateurs, Commandes
- Peut: Créer/modifier/supprimer produits, utilisateurs, clients

// Magasinier
- Accès: Dashboard, Produits, Clients, Commandes
- Peut: Créer/modifier/supprimer produits, gérer stock

// Employé (Vendeur)
- Accès: Profil, Dashboard vendeur, Mes Produits, Boutique, Commandes
- Peut: Créer/modifier ses propres produits, voir ses commandes
- Bloqué: Ne peut pas accéder à products.html

// Client
- Accès: Profil, Boutique, Commandes
- Peut: Voir produits, ajouter au panier, passer commandes
```

---

## 📄 5. PAGES FRONTEND - DÉTAILS

### **index.html** (Login)
- Formulaire login email/password
- Vérification authentification
- Redirection vers dashboard/boutique selon rôle

### **register.html** (Inscription)
- Formulaire création compte
- Sélection rôle
- Validation email unique

### **profile.html** (Profil Utilisateur) ⭐
**Accessible par**: Tous les rôles authentifiés

**Sections**:
- 🖼️ Avatar (upload image base64)
- 📋 Informations personnelles (nom, email, rôle, date inscription)
- ✍️ Biographie (modifiable)
- 🔒 Paramètres compte
- 🔑 Changement mot de passe
- 📊 Statistiques (ordre pour Client, produits pour Employé)

**Fonctionnalités JS**:
- `loadProfileData()` - Charge profil utilisateur
- `updateProfileManagementButtons()` - Gère boutons ajouter/modifier profil
- `handleAvatarUpload()` - Upload avatar en base64
- `uploadAvatarToServer()` - Envoie à l'API
- `editBio()` / `saveBio()` / `cancelBioEdit()` - Gestion bio
- `updatePassword()` - Change mot de passe

### **dashboard.html** (Dashboard Admin/Magasinier)
**Accessible par**: Administrateur, Magasinier

**Affiche**:
- 📊 Statistiques globales (total produits, utilisateurs, commandes)
- 📈 Graphiques ventes
- 📋 Listes récentes produits/commandes

**Controllers**: dashboard.js

### **seller-dashboard.html** (Dashboard Vendeur)
**Accessible par**: Employé uniquement

**Affiche**:
- 📦 Nombre produits publiés
- 🛒 Nombre commandes reçues
- 💰 Revenu total généré
- 📋 Produits récents
- 🛒 Commandes récentes

### **products.html** (Gestion Produits)
**Accessible par**: Administrateur, Magasinier
**Bloqué pour**: Employé (redirigé vers seller-products.html)

**Fonctionnalités**:
- 📋 Table tous les produits
- 🔍 Recherche/filtres (catégorie, genre)
- ➕ Ajouter produit
- ✏️ Modifier produit
- 🗑️ Supprimer produit
- 📊 Voir variantes

### **seller-products.html** (Mes Produits - Vendeur)
**Accessible par**: Employé uniquement

**Fonctionnalités**:
- 📋 Table produits du vendeur
- ➕ Créer nouveau produit
  - Reference unique
  - Nom, description
  - Catégorie, genre, saison
  - Prix achat/vente
  - Variantes (taille, couleur, quantité)
  - Image produit
- ✏️ Modifier ses produits
- 🗑️ Supprimer ses produits
- 🔍 Recherche/filtres

**Important**: `vendeur_id` est enregistré lors de la création

### **client-shop.html** (Boutique Client)
**Accessible par**: Client, Employé

**Fonctionnalités**:
- 🛍️ Grille produits avec images
- 🔍 Recherche par nom/référence
- 📂 Filtrer par catégorie
- 👕 Filtrer par genre
- 🛒 Ajouter au panier
- ℹ️ Détails produit
- 💳 Panier
- 💰 Checkout

**Affichage images**:
```javascript
${product.image_url ? `<img src="${product.image_url}" alt="${product.nom}">` : '👕'}
```

### **commandes.html** (Gestion Commandes)
**Accessible par**: Tous les rôles

**Filtrage par rôle**:
- **Admin/Magasinier**: Voir toutes les commandes
- **Employé**: Voir seulement commandes contenant ses produits
- **Client**: Voir seulement ses propres commandes

**Fonctionnalités**:
- 📋 Liste commandes
- 👁️ Voir détails
- ✓ Valider commande (Admin/Magasinier)
- 📊 Statuts (Créée, Validée, Expédiée, Livrée, Annulée)

### **clients.html** (Gestion Clients)
**Accessible par**: Administrateur, Magasinier

**Fonctionnalités**:
- 👥 Liste clients
- ➕ Ajouter client
- ✏️ Modifier client
- 🗑️ Supprimer client
- 📊 Voir commandes/total achats

### **users.html** (Gestion Utilisateurs)
**Accessible par**: Administrateur uniquement

**Fonctionnalités**:
- 👤 Liste utilisateurs
- ➕ Créer utilisateur
- ✏️ Modifier utilisateur
- 🗑️ Supprimer utilisateur
- 🎭 Changer rôle

---

## 🔌 6. API ENDPOINTS

### Authentification
```
POST   /api/auth/login              - Login (email, password)
POST   /api/auth/register           - Inscription
```

### Utilisateurs
```
GET    /api/users                   - Tous les utilisateurs (Admin)
GET    /api/users/:id               - Un utilisateur
PUT    /api/users/:id               - Modifier utilisateur
PUT    /api/users/:id/avatar        - Upload avatar
PUT    /api/users/:id/password      - Changer mot de passe
DELETE /api/users/:id               - Supprimer utilisateur (Admin)
```

### Produits
```
GET    /api/products                - Tous les produits
GET    /api/products/:id            - Un produit
POST   /api/products                - Créer produit (Admin, Magasinier, Employé)
PUT    /api/products/:id            - Modifier produit (Admin, Magasinier, Employé)
DELETE /api/products/:id            - Supprimer produit (Admin)
GET    /api/products/categories/all - Toutes catégories
```

### Commandes
```
GET    /api/commandes               - Commandes (filtrées par rôle)
GET    /api/commandes/:id           - Détails commande
POST   /api/commandes               - Créer commande
PUT    /api/commandes/:id/statut    - Changer statut
PUT    /api/commandes/:id/valider   - Valider commande
```

### Clients
```
GET    /api/clients                 - Tous les clients
GET    /api/clients/:id             - Un client
POST   /api/clients                 - Créer client
PUT    /api/clients/:id             - Modifier client
DELETE /api/clients/:id             - Supprimer client (Admin)
```

### Dashboard
```
GET    /api/dashboard/stats         - Statistiques globales
GET    /api/dashboard/alertes       - Alertes stock
```

---

## 💾 7. STRUCTURE DES FICHIERS CLÉS

### **api.js** (Frontend Configuration)
```javascript
// Configuration API
const API_URL = 'http://localhost:5000/api';

// Fonction requête API
async function apiRequest(endpoint, method='GET', data=null)

// Gestion navigation centralisée
function loadNavigation(role)
  - Affiche/cache liens selon rôle
  - Gère 9 liens: dashboard, profile, products, 
    seller-dashboard, seller-products, shop, 
    clients, commandes, users
```

### **auth.js** (Frontend Authentification)
```javascript
// Vérifier authentification
function isAuthenticated() → boolean

// Récupérer utilisateur
function getUser() → user object

// Récupérer token
function getToken() → token string

// Logout
function logout()

// Enregistrer utilisateur localStorage
function setUser(user), setToken(token)
```

### **authController.js** (Backend Authentification)
```javascript
// Login
exports.login = async (req, res)
  - Vérifier email/password
  - Générer JWT token
  - Retourner user + token

// Register
exports.register = async (req, res)
  - Créer nouvel utilisateur
  - Hash password avec bcrypt
  - Assigner rôle par défaut
  - Retourner user + token
```

### **productController.js** (Backend Produits)
```javascript
// Créer produit
exports.createProduct = async (req, res)
  - Récupère vendeur_id = req.user.id
  - Insère produit + variantes
  - Logger l'action

// Récupérer produits
exports.getAllProducts = async (req, res)
  - JOIN avec Categorie
  - GROUP BY pour variantes

// Mettre à jour produit
exports.updateProduct = async (req, res)
  - Permet modification vendeur de ses produits

// Supprimer produit
exports.deleteProduct = async (req, res)
  - Admin uniquement
```

### **roleMiddleware.js** (Backend Contrôle Rôles)
```javascript
exports.checkRole = (...roles) 
  - Middleware pour vérifier rôle utilisateur
  - Bloque 403 si rôle non autorisé
```

### **authMiddleware.js** (Backend JWT)
```javascript
exports.authMiddleware = (req, res, next)
  - Vérifier token JWT
  - Décoder user info
  - Passer user à req.user
```

---

## 🔄 8. FLUX UTILISATEUR PAR RÔLE

### **CLIENT**
```
1. index.html (Login)
   ↓
2. client-shop.html (Voir produits)
   ↓
3. Ajouter au panier
   ↓
4. Checkout
   ↓
5. commandes.html (Voir mes commandes)
   ↓
6. profile.html (Profil + bio + avatar)
```

### **EMPLOYÉ (Vendeur)**
```
1. index.html (Login)
   ↓
2. seller-dashboard.html (Voir stats)
   ↓
3. seller-products.html (Ajouter produits)
   → Créer produit avec image
   → vendeur_id auto enregistré
   ↓
4. client-shop.html (Voir ses produits)
   ↓
5. commandes.html (Voir commandes de ses produits)
   ↓
6. profile.html (Profil + bio + avatar)

BLOQUÉ: products.html (redirigé vers seller-products.html)
```

### **MAGASINIER**
```
1. dashboard.html (Stats)
   ↓
2. products.html (Gérer tous produits)
   ↓
3. clients.html (Gérer clients)
   ↓
4. commandes.html (Voir/valider commandes)
   ↓
5. profile.html (Profil)
```

### **ADMINISTRATEUR**
```
1. dashboard.html (Stats)
   ↓
2. products.html (Gérer produits)
   ↓
3. clients.html (Gérer clients)
   ↓
4. commandes.html (Valider commandes)
   ↓
5. users.html (Gérer utilisateurs)
   ↓
6. profile.html (Profil)
```

---

## 🛠️ 9. TECHNOLOGIES UTILISÉES

### Backend
- **Node.js** - Serveur JavaScript
- **Express.js** - Framework web
- **MySQL 2** - Driver base de données
- **JWT** - Authentification tokens
- **bcryptjs** - Hash passwords
- **cors** - CORS handling
- **dotenv** - Variables environnement

### Frontend
- **HTML5** - Structure
- **CSS3** - Styles
- **JavaScript ES6+** - Logique
- **Fetch API** - Requêtes HTTP
- **LocalStorage** - Stockage client
- **FileReader API** - Upload images (base64)

### Outils
- **MySQL/MariaDB** - Base données
- **VS Code** - Éditeur
- **Postman** - Test API (optionnel)

---

## 🚀 10. DÉMARRAGE DU PROJET

### Installation
```bash
# Backend
cd backend
npm install
npm start

# Frontend
Ouvrir index.html dans le navigateur
(ou utiliser Live Server VS Code)
```

### Configuration
```bash
# backend/config/database.js
host: 'localhost'
user: 'root'
password: '' (par défaut)
database: 'ocho_db'
```

### Données Test
```javascript
// Admin
email: admin@ocho.com
password: admin123

// Magasinier
email: magasin@ocho.com
password: magasin123

// Vendeur
email: vendeur@ocho.com
password: vendeur123

// Client
email: client@ocho.com
password: client123
```

---

## 📊 11. MODÈLE DE DONNÉES

```
┌─────────────────┐
│   Utilisateur   │
├─────────────────┤
│ id (PK)         │
│ nom             │
│ email           │
│ mot_de_passe    │
│ role_id (FK)    │◄────────┐
│ avatar          │         │
│ bio             │         │
│ created_at      │         │
└─────────────────┘         │
        │                    │
        │ vendeur_id         │
        └────────┐           │
                 │           │
            ┌────▼───────────┤
            │   Produit      │
            ├────────────────┤
            │ id (PK)        │
            │ reference      │
            │ nom            │
            │ description    │
            │ categorie_id───┼──────────┐
            │ vendeur_id     │          │
            │ genre          │          │
            │ prix_vente     │          │
            │ stock_total    │          │
            │ created_at     │          │
            └────────────────┘          │
                    │                   │
                    │ produit_id        │
                    │                   │
            ┌───────▼──────────┐   ┌────▼──────────┐
            │    Variante      │   │   Categorie   │
            ├──────────────────┤   ├───────────────┤
            │ id (PK)          │   │ id (PK)       │
            │ produit_id (FK)  │   │ nom           │
            │ taille           │   │ description   │
            │ couleur          │   │ image_url     │
            │ quantite         │   │ created_at    │
            └──────────────────┘   └───────────────┘

        ┌──────────────────────┐
        │      Commande        │
        ├──────────────────────┤
        │ id (PK)              │
        │ reference            │
        │ client_id (FK)       │◄──────┐
        │ client_nom           │       │
        │ date_commande        │       │ client_id (FK)
        │ total                │       │
        │ statut               │       │
        │ created_at           │       │
        └──────────────────────┘       │
                │                       │
                │ commande_id           │
                │                   ┌───┴──────────────┐
        ┌───────▼──────────────┐    │     Client       │
        │   LigneCommande      │    ├──────────────────┤
        ├──────────────────────┤    │ id (PK)          │
        │ id (PK)              │    │ nom              │
        │ commande_id (FK)     │    │ prenom           │
        │ produit_id (FK)      │    │ email            │
        │ quantite             │    │ telephone        │
        │ prix_unitaire        │    │ adresse          │
        │ total_ligne          │    │ ville            │
        └──────────────────────┘    │ created_at       │
                                    └──────────────────┘

        ┌──────────────────┐
        │      Role        │
        ├──────────────────┤
        │ id (PK)          │
        │ nom              │
        │ description      │
        └──────────────────┘
```

---

## 🎨 12. INTERFACE UTILISATEUR

### Navigation Commune
- Logo OCHO
- Rôle utilisateur affiché
- Liens navigation (variables selon rôle)
- Profil & Déconnexion

### Design
- Couleurs: Gradient bleu-violet (#667eea - #764ba2)
- Responsive: Mobile-first
- Layout: Sidebar + Main content
- Tables: Searchable, sortable
- Modales: Pour formulaires

---

## 🔐 13. SÉCURITÉ

### Implémentations
- ✅ JWT authentification
- ✅ Password hashing (bcrypt)
- ✅ Contrôle accès par rôle
- ✅ Vérification token à chaque requête
- ✅ CORS configuré
- ✅ SQL prepared statements
- ✅ Validation données frontend + backend

### À Améliorer
- ⚠️ Ajouter refresh tokens
- ⚠️ Rate limiting
- ⚠️ HTTPS en production
- ⚠️ Sanitize inputs
- ⚠️ Protection CSRF

---

## 📝 14. POINTS IMPORTANTS À RETENIR

### Vendeurs (Employé)
- ✅ Créent leurs propres produits
- ✅ `vendeur_id` enregistré automatiquement
- ✅ Voient leurs produits dans "Mes Produits"
- ✅ Voient les commandes de leurs produits
- ❌ Ne peuvent pas accéder à products.html
- ❌ Ne peuvent pas voir le dashboard admin

### Images Produits
- Stockées via URL (`image_url` VARCHAR(255))
- Fallback emoji 👕 si pas d'image
- Base64 pour avatars utilisateur

### Profil Utilisateur
- Avatar: Upload base64 LONGTEXT
- Bio: Texte modifiable
- Info personnelles: Pré-remplies et non modifiables
- Mot de passe: Changeable

### Statuts Commande
- `Créée` - Nouvelle commande
- `Validée` - Confirmée par admin/magasinier
- `Expédiée` - En cours de livraison
- `Livrée` - Reçue par client
- `Annulée` - Commande annulée

---

## 🔧 15. DÉPANNAGE COURANT

### Erreur 403 Forbidden
**Cause**: Rôle utilisateur non autorisé
**Solution**: Vérifier rôle dans localStorage et middleware

### Produits ne s'affichent pas
**Cause**: `vendeur_id` NULL ou filtre incorrect
**Solution**: Vérifier `vendeur_id` lors création + filtrage

### Images ne s'affichent pas
**Cause**: URL invalide ou image_url NULL
**Solution**: Utiliser `image_url` ou fallback emoji

### Token expiré
**Cause**: Session expirée
**Solution**: Rediriger vers login, clear localStorage

---

## 📞 SUPPORT

Pour toute question sur la structure ou le fonctionnement:
1. Vérifier les routes dans `backend/routes/`
2. Vérifier les contrôleurs dans `backend/controllers/`
3. Vérifier les fonctions JS dans `frontend/js/`
4. Consulter la base de données `ocho_db`

---

**Dernière mise à jour**: 11 Janvier 2026
**Version**: 2.0 (avec vendeurs et bio)
**Auteur**: Équipe OCHO
