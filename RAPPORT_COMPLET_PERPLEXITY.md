# 📊 RAPPORT COMPLET DU PROJET OCHO - Gestion de Stock

**Date:** 5 Janvier 2026  
**Version:** 1.0.0  
**Statut:** À terminer et déployer

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture système](#architecture)
3. [Structure complète des fichiers](#structure)
4. [Code source détaillé](#code-source)
5. [Base de données](#base-de-données)
6. [API Endpoints](#api-endpoints)
7. [Points à terminer](#points-à-terminer)
8. [Instructions de déploiement](#instructions-déploiement)

---

## 📱 VUE D'ENSEMBLE {#vue-densemble}

### Description du Projet
OCHO est une **application web complète de gestion de stock** destinée aux PME du secteur des vêtements. Elle permet :
- ✅ Gestion des produits avec variantes (taille, couleur, stock)
- ✅ Gestion des clients
- ✅ Gestion des commandes
- ✅ Authentification et autorisation par rôle
- ✅ Dashboard avec statistiques
- ✅ Système de logs d'audit

### Stack Technologique
| Composant | Technologie | Version |
|-----------|------------|---------|
| Frontend | HTML5/CSS3/JavaScript Vanilla | ES6+ |
| Backend | Node.js + Express | 14.0+ |
| Base de données | MySQL | 5.7+ |
| Authentification | JWT | jsonwebtoken 9.0.3 |
| Sécurité | bcrypt | 6.0.0 |
| CORS | cors | 2.8.5 |

### Rôles et Permissions
```
Administrateur:
  ✓ Tout faire (CRUD complet)
  ✓ Créer/modifier/supprimer produits
  ✓ Gérer utilisateurs
  ✓ Voir tous les logs

Magasinier:
  ✓ Créer/modifier produits
  ✗ Supprimer produits
  ✓ Gérer stock
  ✓ Voir commandes

Vendeur:
  ✓ Lire produits
  ✓ Créer/modifier commandes
  ✗ Supprimer produits
  ✗ Créer produits
```

---

## 🏗️ ARCHITECTURE {#architecture}

### Diagramme Système

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (HTML/JS)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Login      │  │  Dashboard   │  │   Pages      │           │
│  │   Form       │  │   Stats      │  │   CRUD       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/JSON
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS API SERVER (Node.js)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Middleware Layer                       │ │
│  │  • CORS  • JSON Parser  • JWT Verification  • Role Check   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │  Auth        │  Products    │  Clients     │                │
│  │  Routes      │  Routes      │  Routes      │                │
│  └──────────────┴──────────────┴──────────────┘                │
│         ↓              ↓              ↓                          │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │  Auth        │  Product     │  Client      │                │
│  │  Controller  │  Controller  │  Controller  │                │
│  └──────────────┴──────────────┴──────────────┘                │
│         ↓              ↓              ↓                          │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │  Commande    │  Dashboard   │  DB Query    │                │
│  │  Routes      │  Routes      │  Layer       │                │
│  └──────────────┴──────────────┴──────────────┘                │
└────────────────────────────┬─────────────────────────────────────┘
                             │ MySQL Protocol
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE (XAMPP)                      │
│                      Base: ocho_db                               │
└─────────────────────────────────────────────────────────────────┘
```

### Flux d'Authentification

```
1. Utilisateur saisit email + mot de passe
   ↓
2. Frontend envoie POST /api/auth/login
   ↓
3. Backend vérifie credentials:
   • Cherche utilisateur par email
   • Valide mot de passe avec bcrypt
   • Récupère le rôle
   ↓
4. Crée JWT token (valide 24h)
   ↓
5. Retourne {token, user} au frontend
   ↓
6. Frontend sauvegarde token en localStorage
   ↓
7. Requêtes suivantes incluent: Authorization: Bearer TOKEN
   ↓
8. Middleware authMiddleware décrypte le token
   ↓
9. roleMiddleware vérifie les permissions
   ↓
10. Route traitée si autorisé
```

---

## 📁 STRUCTURE COMPLÈTE DES FICHIERS {#structure}

```
OCHO/
├── 📄 README.md                          # Documentation principale
├── 📄 QUICKSTART.md                      # Démarrage rapide
├── 📄 TESTING.md                         # Guide de test
├── 📄 CORRECTIONS.md                     # Corrections apportées
├── 📄 SUMMARY.md                         # Résumé complet
├── 📄 ARCHITECTURE.md                    # Architecture détaillée
├── 📄 CHECKLIST.md                       # Checklist installation
├── 📄 FINAL_REPORT.txt                   # Rapport final
│
├── 📁 backend/
│   ├── 📄 server.js                      # Serveur Express principal
│   ├── 📄 package.json                   # Dépendances Node.js
│   ├── 📄 .env                           # Variables d'environnement
│   │
│   ├── 📁 config/
│   │   ├── 📄 database.js                # Pool de connexion MySQL
│   │   └── 📄 init.sql                   # Schéma BD complète
│   │
│   ├── 📁 controllers/
│   │   ├── 📄 authController.js          # Connexion/inscription
│   │   ├── 📄 productController.js       # CRUD produits
│   │   ├── 📄 clientController.js        # CRUD clients
│   │   ├── 📄 commandeController.js      # CRUD commandes
│   │   └── 📄 dashboardController.js     # Statistiques
│   │
│   ├── 📁 middleware/
│   │   ├── 📄 authMiddleware.js          # Vérification JWT
│   │   └── 📄 roleMiddleware.js          # Vérification rôles
│   │
│   └── 📁 routes/
│       ├── 📄 authRoutes.js              # Routes d'auth
│       ├── 📄 productRoutes.js           # Routes produits
│       ├── 📄 clientRoutes.js            # Routes clients
│       ├── 📄 commandeRoutes.js          # Routes commandes
│       └── 📄 dashboardRoutes.js         # Routes dashboard
│
└── 📁 frontend/
    ├── 📄 index.html                     # Page de connexion
    │
    ├── 📁 css/
    │   └── 📄 style.css                  # Styles de connexion
    │
    ├── 📁 js/
    │   ├── 📄 api.js                     # Fonctions API
    │   └── 📄 auth.js                    # Gestion authentification
    │
    ├── 📁 pages/                         # ⚠️ À CRÉER
    │   ├── 📄 dashboard.html             # Dashboard
    │   ├── 📄 products.html              # Gestion produits
    │   ├── 📄 clients.html               # Gestion clients
    │   └── 📄 commandes.html             # Gestion commandes
    │
    └── 📁 assets/
        └── 📁 images/                    # Images du projet
```

---

## 💻 CODE SOURCE DÉTAILLÉ {#code-source}

### 1. Backend - Serveur Principal

**Fichier: `backend/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bienvenue sur l\'API OCHO 🚀',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            auth: '/api/auth (login, register)',
            products: '/api/products',
            clients: '/api/clients',
            commandes: '/api/commandes',
            dashboard: '/api/dashboard'
        }
    });
});

// Test connexion base de données
app.get('/api/test-db', async (req, res) => {
    try {
        const db = require('./config/database');
        const [rows] = await db.query('SELECT COUNT(*) as total FROM Produit');
        res.json({ 
            success: true,
            message: 'Connexion DB réussie', 
            total_produits: rows[0].total 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur connexion DB', 
            details: error.message 
        });
    }
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Démarrage serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Serveur OCHO démarré avec succès!');
    console.log('═══════════════════════════════════════');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📊 Base de données: ${process.env.DB_NAME}`);
    console.log(`🔐 Mode: ${process.env.NODE_ENV}`);
    console.log('═══════════════════════════════════════');
});
```

### 2. Configuration Base de Données

**Fichier: `backend/config/database.js`**

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ocho_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion au démarrage
pool.getConnection()
    .then((connection) => {
        console.log('✅ Connexion à la base de données réussie');
        connection.release();
    })
    .catch((error) => {
        console.error('❌ Erreur de connexion à la base de données:', error.message);
    });

module.exports = pool;
```

### 3. Contrôleur d'Authentification

**Fichier: `backend/controllers/authController.js`**

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
    try {
        const { nom, email, mot_de_passe, role_id } = req.body;

        // Vérifier si l'email existe déjà
        const [existing] = await db.query('SELECT id FROM Utilisateur WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        // Insérer l'utilisateur
        const [result] = await db.query(
            'INSERT INTO Utilisateur (nom, email, mot_de_passe, role_id) VALUES (?, ?, ?, ?)',
            [nom, email, hashedPassword, role_id || 3]
        );

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Récupérer l'utilisateur avec son rôle
        const [users] = await db.query(
            `SELECT u.*, r.nom as role_nom 
             FROM Utilisateur u 
             JOIN Role r ON u.role_id = r.id 
             WHERE u.email = ? AND u.actif = true`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_nom },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // Logger la connexion
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, details) VALUES (?, ?, ?)',
            [user.id, 'Connexion', `Connexion réussie pour ${user.email}`]
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role_nom
            }
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Vérifier le token
exports.verifyToken = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};
```

### 4. Contrôleur Produits

**Fichier: `backend/controllers/productController.js`**

```javascript
const db = require('../config/database');

// Obtenir tous les produits avec leurs variantes
exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.*,
                c.nom as categorie_nom,
                COUNT(DISTINCT v.id) as nombre_variantes,
                SUM(v.quantite) as stock_total
            FROM Produit p
            LEFT JOIN Categorie c ON p.categorie_id = c.id
            LEFT JOIN Variante v ON p.id = v.produit_id
            WHERE p.actif = true
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);

        res.json({ success: true, products });
    } catch (error) {
        console.error('Erreur getAllProducts:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir un produit par ID avec ses variantes
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const [products] = await db.query(`
            SELECT p.*, c.nom as categorie_nom
            FROM Produit p
            LEFT JOIN Categorie c ON p.categorie_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Produit non trouvé' });
        }

        const [variantes] = await db.query(
            'SELECT * FROM Variante WHERE produit_id = ?',
            [id]
        );

        res.json({
            success: true,
            product: {
                ...products[0],
                variantes
            }
        });
    } catch (error) {
        console.error('Erreur getProductById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Créer un nouveau produit
exports.createProduct = async (req, res) => {
    try {
        const {
            reference,
            nom,
            categorie_id,
            genre,
            saison,
            prix_achat,
            prix_vente,
            seuil_min,
            variantes
        } = req.body;

        // Insérer le produit
        const [result] = await db.query(
            `INSERT INTO Produit 
            (reference, nom, categorie_id, genre, saison, prix_achat, prix_vente, seuil_min)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [reference, nom, categorie_id, genre, saison || 'Toute saison', prix_achat, prix_vente, seuil_min || 10]
        );

        const productId = result.insertId;

        // Insérer les variantes si fournies
        if (variantes && Array.isArray(variantes)) {
            for (const v of variantes) {
                await db.query(
                    'INSERT INTO Variante (produit_id, taille, couleur, quantite) VALUES (?, ?, ?, ?)',
                    [productId, v.taille, v.couleur, v.quantite || 0]
                );
            }
        }

        // Logger l'action
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Création produit', 'Produit', productId]
        );

        res.status(201).json({
            success: true,
            message: 'Produit créé avec succès',
            productId
        });
    } catch (error) {
        console.error('Erreur createProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const fields = [];
        const values = [];

        // Construire la requête dynamiquement
        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id' && key !== 'variantes') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'Aucune donnée à mettre à jour' });
        }

        values.push(id);

        await db.query(
            `UPDATE Produit SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        // Logger l'action
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Modification produit', 'Produit', id]
        );

        res.json({ success: true, message: 'Produit mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur updateProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Supprimer un produit (soft delete)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('UPDATE Produit SET actif = false WHERE id = ?', [id]);

        // Logger l'action
        await db.query(
            'INSERT INTO LogsSysteme (utilisateur_id, action, table_concernee, enregistrement_id) VALUES (?, ?, ?, ?)',
            [req.user.id, 'Suppression produit', 'Produit', id]
        );

        res.json({ success: true, message: 'Produit supprimé avec succès' });
    } catch (error) {
        console.error('Erreur deleteProduct:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Obtenir les catégories
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM Categorie WHERE actif = true');
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Erreur getCategories:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
```

### 5. Middleware - Authentification

**Fichier: `backend/middleware/authMiddleware.js`**

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token du header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token manquant' });
        }

        const token = authHeader.split(' ')[1];

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les infos utilisateur à la requête
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erreur auth:', error);
        return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
};

module.exports = authMiddleware;
```

### 6. Middleware - Rôles

**Fichier: `backend/middleware/roleMiddleware.js`**

```javascript
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Non authentifié' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès non autorisé pour votre rôle' 
            });
        }

        next();
    };
};

module.exports = { checkRole };
```

### 7. Routes - Authentification

**Fichier: `backend/routes/authRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;
```

### 8. Routes - Produits

**Fichier: `backend/routes/productRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Routes produits
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', checkRole('Administrateur', 'Magasinier'), productController.createProduct);
router.put('/:id', checkRole('Administrateur', 'Magasinier'), productController.updateProduct);
router.delete('/:id', checkRole('Administrateur'), productController.deleteProduct);

// Routes catégories
router.get('/categories/all', productController.getCategories);

module.exports = router;
```

### 9. Frontend - API Client

**Fichier: `frontend/js/api.js`**

```javascript
// Configuration de l'API
const API_URL = 'http://localhost:3000/api';

// Fonction pour obtenir le token
function getToken() {
    return localStorage.getItem('token');
}

// Fonction pour faire des requêtes API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Erreur API');
        }
        
        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Fonctions API spécifiques
const API = {
    // Authentification
    login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
    
    // Produits
    getProducts: () => apiRequest('/products'),
    createProduct: (data) => apiRequest('/products', 'POST', data),
    
    // Clients
    getClients: () => apiRequest('/clients'),
    
    // Dashboard
    getDashboard: () => apiRequest('/dashboard')
};
```

### 10. Frontend - Authentification

**Fichier: `frontend/js/auth.js`**

```javascript
// Vérifier si l'utilisateur est connecté
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Sauvegarder le token et les infos utilisateur
function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Obtenir les infos utilisateur
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Gestion du formulaire de connexion
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await API.login(email, password);
                
                if (result.success) {
                    saveAuth(result.token, result.user);
                    messageDiv.className = 'message success';
                    messageDiv.textContent = 'Connexion réussie !';
                    
                    setTimeout(() => {
                        window.location.href = 'pages/dashboard.html';
                    }, 1000);
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = error.message || 'Email ou mot de passe incorrect';
            }
        });
    }
});
```

### 11. Frontend - HTML Login

**Fichier: `frontend/index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OCHO - Connexion</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <div class="login-box">
            <h1>OCHO</h1>
            <h2>Gestion de Stock</h2>
            <form id="loginForm">
                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="input-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn-primary">Se connecter</button>
                <div id="message" class="message"></div>
            </form>
        </div>
    </div>
    <script src="js/api.js"></script>
    <script src="js/auth.js"></script>
</body>
</html>
```

### 12. Frontend - CSS

**Fichier: `frontend/css/style.css`**

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

.login-box {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login-box h1 {
    color: #667eea;
    text-align: center;
    margin-bottom: 10px;
    font-size: 2.5em;
}

.login-box h2 {
    color: #666;
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.2em;
    font-weight: normal;
}

.input-group {
    margin-bottom: 20px;
}

.input-group label {
    display: block;
    margin-bottom: 5px;
    color: #333;
    font-weight: 500;
}

.input-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.input-group input:focus {
    outline: none;
    border-color: #667eea;
}

.btn-primary {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.btn-primary:hover {
    transform: translateY(-2px);
}

.message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
    display: none;
}

.message.success {
    background-color: #d4edda;
    color: #155724;
    display: block;
}

.message.error {
    background-color: #f8d7da;
    color: #721c24;
    display: block;
}
```

### 13. Package.json

**Fichier: `backend/package.json`**

```json
{
  "name": "ocho-backend",
  "version": "1.0.0",
  "description": "API REST pour la gestion de stock OCHO",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "stock",
    "gestion",
    "api",
    "express",
    "mysql"
  ],
  "author": "",
  "license": "ISC",
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mysql2": "^3.16.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

### 14. Configuration Environnement

**Fichier: `backend/.env`**

```dotenv
# Configuration serveur
PORT=3000
NODE_ENV=development

# Configuration base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ocho_db
DB_PORT=3307

# Configuration JWT
JWT_SECRET=ocho_secret_jwt_2026_change_me_in_production
JWT_EXPIRE=24h    
```

---

## 🗄️ BASE DE DONNÉES {#base-de-données}

### Schéma des Tables

#### 1. Table `Role`
```sql
CREATE TABLE Role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role_nom (nom)
) ENGINE=InnoDB;
```

#### 2. Table `Utilisateur`
```sql
CREATE TABLE Utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Role(id) ON DELETE RESTRICT,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role_id),
    INDEX idx_user_actif (actif)
) ENGINE=InnoDB;
```

#### 3. Table `Client`
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
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_nom (nom),
    INDEX idx_client_email (email),
    INDEX idx_client_actif (actif)
) ENGINE=InnoDB;
```

#### 4. Table `Categorie`
```sql
CREATE TABLE Categorie (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categorie_nom (nom)
) ENGINE=InnoDB;
```

#### 5. Table `Produit`
```sql
CREATE TABLE Produit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    categorie_id INT NOT NULL,
    genre ENUM('Homme', 'Femme', 'Enfant', 'Unisexe') NOT NULL,
    saison ENUM('Été', 'Hiver', 'Printemps', 'Automne', 'Toute saison') DEFAULT 'Toute saison',
    marque VARCHAR(100),
    prix_achat DECIMAL(10, 2) NOT NULL,
    prix_vente DECIMAL(10, 2) NOT NULL,
    seuil_min INT DEFAULT 10,
    image_url VARCHAR(255),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categorie_id) REFERENCES Categorie(id) ON DELETE RESTRICT,
    INDEX idx_produit_reference (reference),
    INDEX idx_produit_categorie (categorie_id),
    INDEX idx_produit_genre (genre),
    INDEX idx_produit_actif (actif),
    INDEX idx_produit_nom (nom)
) ENGINE=InnoDB;
```

#### 6. Table `Variante`
```sql
CREATE TABLE Variante (
    id INT PRIMARY KEY AUTO_INCREMENT,
    produit_id INT NOT NULL,
    taille VARCHAR(10) NOT NULL,
    couleur VARCHAR(50) NOT NULL,
    code_couleur VARCHAR(7),
    quantite INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES Produit(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variante (produit_id, taille, couleur),
    INDEX idx_variante_produit (produit_id),
    INDEX idx_variante_quantite (quantite),
    CONSTRAINT chk_quantite CHECK (quantite >= 0)
) ENGINE=InnoDB;
```

#### 7. Table `Commande`
```sql
CREATE TABLE Commande (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    utilisateur_id INT,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('Créée', 'Validée', 'En cours', 'Livrée', 'Annulée') DEFAULT 'Créée',
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Client(id) ON DELETE RESTRICT,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE SET NULL,
    INDEX idx_commande_reference (reference),
    INDEX idx_commande_client (client_id),
    INDEX idx_commande_statut (statut),
    INDEX idx_commande_date (date_commande)
) ENGINE=InnoDB;
```

#### 8. Table `LigneCommande`
```sql
CREATE TABLE LigneCommande (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL,
    variante_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    sous_total DECIMAL(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES Commande(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_id) REFERENCES Variante(id) ON DELETE RESTRICT,
    FOREIGN KEY (produit_id) REFERENCES Produit(id) ON DELETE RESTRICT,
    INDEX idx_ligne_commande (commande_id),
    INDEX idx_ligne_variante (variante_id),
    CONSTRAINT chk_ligne_quantite CHECK (quantite > 0)
) ENGINE=InnoDB;
```

---

## 🔌 API ENDPOINTS {#api-endpoints}

### Authentification

#### POST /api/auth/login
```json
Requête:
{
  "email": "admin@ocho.com",
  "password": "admin123"
}

Réponse:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "Admin",
    "email": "admin@ocho.com",
    "role": "Administrateur"
  }
}
```

#### POST /api/auth/register
```json
Requête:
{
  "nom": "Nouveau User",
  "email": "user@ocho.com",
  "mot_de_passe": "password123",
  "role_id": 3
}

Réponse:
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "userId": 2
}
```

#### GET /api/auth/verify
```
Headers: Authorization: Bearer {TOKEN}

Réponse:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@ocho.com",
    "role": "Administrateur"
  }
}
```

### Produits

#### GET /api/products
```json
Réponse:
{
  "success": true,
  "products": [
    {
      "id": 1,
      "reference": "PROD001",
      "nom": "T-Shirt Bleu",
      "categorie_nom": "Vêtements",
      "prix_vente": 29.99,
      "stock_total": 50,
      "nombre_variantes": 3
    }
  ]
}
```

#### POST /api/products
```json
Requête:
{
  "reference": "PROD001",
  "nom": "T-Shirt Bleu",
  "categorie_id": 1,
  "genre": "Homme",
  "saison": "Toute saison",
  "prix_achat": 15.00,
  "prix_vente": 29.99,
  "seuil_min": 10,
  "variantes": [
    { "taille": "S", "couleur": "Bleu", "quantite": 10 },
    { "taille": "M", "couleur": "Bleu", "quantite": 20 },
    { "taille": "L", "couleur": "Bleu", "quantite": 20 }
  ]
}

Réponse:
{
  "success": true,
  "message": "Produit créé avec succès",
  "productId": 1
}
```

### Clients

#### GET /api/clients
```json
Réponse:
{
  "success": true,
  "clients": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@email.com",
      "telephone": "01234567890",
      "ville": "Paris",
      "actif": true
    }
  ]
}
```

#### POST /api/clients
```json
Requête:
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "telephone": "01234567890",
  "adresse": "123 Rue de la Paix",
  "ville": "Paris",
  "code_postal": "75001"
}

Réponse:
{
  "success": true,
  "message": "Client créé avec succès",
  "clientId": 1
}
```

### Commandes

#### POST /api/commandes
```json
Requête:
{
  "client_id": 1,
  "articles": [
    {
      "variante_id": 1,
      "produit_id": 1,
      "quantite": 2,
      "prix_unitaire": 29.99
    }
  ],
  "notes": "À livrer avant 17h"
}

Réponse:
{
  "success": true,
  "message": "Commande créée avec succès",
  "commandeId": 1,
  "reference": "CMD20260105001"
}
```

#### GET /api/commandes
```json
Réponse:
{
  "success": true,
  "commandes": [
    {
      "id": 1,
      "reference": "CMD20260105001",
      "client_nom": "Dupont",
      "statut": "Créée",
      "total": 59.98,
      "date_commande": "2026-01-05T10:00:00Z"
    }
  ]
}
```

#### PUT /api/commandes/:id/valider
```json
Requête: (vide)

Réponse:
{
  "success": true,
  "message": "Commande validée avec succès"
}
```

#### PUT /api/commandes/:id/statut
```json
Requête:
{
  "statut": "Livrée"
}

Réponse:
{
  "success": true,
  "message": "Statut de la commande mis à jour"
}
```

### Dashboard

#### GET /api/dashboard/stats
```json
Réponse:
{
  "success": true,
  "stats": {
    "total_produits": 25,
    "stock_total": 500,
    "total_clients": 10,
    "commandes_mois": 15,
    "chiffre_affaires": 5000.00,
    "marge_totale": 1200.00
  }
}
```

---

## ⚠️ POINTS À TERMINER {#points-à-terminer}

### 1. Pages Frontend Manquantes

**À créer:** `frontend/pages/`

Les pages suivantes doivent être créées :

```
frontend/pages/
├── dashboard.html      # Dashboard avec statistiques
├── products.html       # Gestion des produits (CRUD)
├── clients.html        # Gestion des clients (CRUD)
├── commandes.html      # Gestion des commandes
└── (optionnel) utilisateurs.html  # Gestion des utilisateurs
```

**Fonctionnalités requises par page:**

**dashboard.html**
- Afficher les statistiques (total produits, stock, clients, chiffre affaires)
- Graphiques de ventes
- Alertes stock faible (< seuil_min)
- Dernières commandes
- Marge bénéficiaire

**products.html**
- Liste des produits avec pagination
- Créer un nouveau produit (avec variantes)
- Éditer un produit
- Supprimer un produit
- Recherche et filtrage par catégorie
- Gestion des variantes (taille, couleur, stock)

**clients.html**
- Liste des clients
- Créer un nouveau client
- Éditer les infos client
- Voir l'historique des commandes du client
- Soft delete du client
- Recherche par nom/email

**commandes.html**
- Liste des commandes avec pagination
- Créer une nouvelle commande
- Ajouter articles à la commande (avec sélection de variante)
- Valider une commande
- Changer le statut (Créée → Validée → En cours → Livrée)
- Voir les détails de la commande
- Calculer et afficher le total
- Imprimer la commande

### 2. Contrôleurs Backend à Compléter

**clientController.js**
```javascript
exports.getAllClients      // ✅ Lister les clients
exports.getClientById      // ✅ Détails client
exports.createClient       // ✅ Créer client
exports.updateClient       // ⚠️ À implémenter
exports.deleteClient       // ⚠️ À implémenter (soft delete)
```

**commandeController.js**
```javascript
exports.getAllCommandes    // ⚠️ À implémenter
exports.getCommandeById    // ⚠️ À implémenter
exports.createCommande     // ⚠️ À implémenter
exports.validerCommande    // ⚠️ À implémenter
exports.updateStatut       // ⚠️ À implémenter
```

**dashboardController.js**
```javascript
exports.getStatistics      // ⚠️ À implémenter
exports.getAlertes         // ⚠️ À implémenter (stock faible)
```

### 3. Routes Backend à Ajouter

**backend/routes/clientRoutes.js** - À compléter

**backend/routes/commandeRoutes.js** - À créer

**backend/routes/dashboardRoutes.js** - À créer

### 4. Fichiers CSS/JS Frontend à Créer

- `frontend/css/dashboard.css` - Styles dashboard
- `frontend/css/pages.css` - Styles pages CRUD
- `frontend/js/dashboard.js` - Logique dashboard
- `frontend/js/products.js` - CRUD produits
- `frontend/js/clients.js` - CRUD clients
- `frontend/js/commandes.js` - CRUD commandes

### 5. Améliorations Recommandées

- [ ] Pagination côté serveur
- [ ] Validation des données côté serveur (plus stricte)
- [ ] Tests unitaires (Jest/Mocha)
- [ ] Documentation Swagger/OpenAPI
- [ ] Gestion des fichiers (images produits)
- [ ] Notifications toast/alerts
- [ ] Export PDF des commandes
- [ ] Graphiques (Chart.js)
- [ ] Recherche avancée
- [ ] Filtres multiples
- [ ] Gestion des utilisateurs (créer/modifier/supprimer)
- [ ] Logs et audit trail complets

---

## 🚀 INSTRUCTIONS DE DÉPLOIEMENT {#instructions-déploiement}

### Prérequis

1. **Node.js** v14+ : https://nodejs.org/
2. **MySQL** : Via XAMPP (https://www.apachefriends.org/) ou MySQL Server
3. **Git** (optionnel)

### Étape 1: Installation Local

```bash
# 1. Cloner/télécharger le projet
cd OCHO

# 2. Installer les dépendances backend
cd backend
npm install

# 3. Revenir au dossier racine
cd ..
```

### Étape 2: Configuration Base de Données

```bash
# 1. Démarrer XAMPP (Apache + MySQL)
# 2. Ouvrir phpMyAdmin: http://localhost/phpmyadmin
# 3. Créer BD: ocho_db
# 4. Importer init.sql:
#    - Onglet "Importer"
#    - Sélectionner backend/config/init.sql
#    - Cliquer "Exécuter"

# OU via terminal MySQL:
mysql -u root -p < backend/config/init.sql
```

### Étape 3: Configuration Environnement

Vérifier le fichier `backend/.env` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ocho_db
DB_PORT=3306
PORT=3000
JWT_SECRET=ocho_secret_jwt_2026_change_me_in_production
```

### Étape 4: Démarrage du Serveur

```bash
# Mode production
cd backend
npm start

# Mode développement (avec auto-reload)
npm run dev
```

Le serveur démarre sur: **http://localhost:3000**

### Étape 5: Accéder au Frontend

```
http://localhost/OCHO/frontend/
OU
Ouvrir directement: OCHO/frontend/index.html
```

### Identifiants par Défaut

```
Email: admin@ocho.com
Mot de passe: admin123
Rôle: Administrateur
```

### Test de Connexion API

```bash
# Test endpoint basique
curl http://localhost:3000/

# Test connexion BD
curl http://localhost:3000/api/test-db

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ocho.com","password":"admin123"}'
```

### Déploiement Production

**Important avant la production:**

1. Changer `JWT_SECRET` par une clé sécurisée
   ```bash
   openssl rand -base64 32
   ```

2. Définir un mot de passe MySQL
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'password_forte';
   ```

3. Mettre `NODE_ENV=production`

4. Utiliser un serveur web (Nginx/Apache)

5. Configurer HTTPS

6. Ajouter un .gitignore:
   ```
   node_modules/
   .env
   *.log
   .DS_Store
   ```

---

## 📞 RÉSUMÉ POUR PERPLEXITY

### Ce qui est FAIT ✅
- Architecture système complète
- API REST avec authentification JWT
- Authentification et autorisation par rôle
- Base de données MySQL avec 8 tables
- Contrôleurs backend pour auth et produits
- Middleware d'authentification et rôles
- Frontend login page
- Configuration complète (.env, package.json)
- Documentation complète

### Ce qui RESTE À FAIRE ⚠️
1. **5 pages HTML frontend** (dashboard, products, clients, commandes, users)
2. **3 contrôleurs backend** (compléter clients, commandes, dashboard)
3. **3 routes backend** (clientRoutes, commandeRoutes, dashboardRoutes)
4. **CSS/JS pour les pages**
5. **Validation et gestion d'erreurs avancées**
6. **Tests**

### Demande à Perplexity
> "J'ai un projet Node.js/MySQL de gestion de stock. Le backend API est terminé (auth, DB, routes produits). Il me reste à créer les pages frontend (dashboard, CRUD produits/clients/commandes) et compléter quelques contrôleurs backend. Voir le rapport pour tous les détails du code et de l'architecture. Peux-tu m'aider à terminer le projet?"

---

**Fin du Rapport - 5 Janvier 2026**

