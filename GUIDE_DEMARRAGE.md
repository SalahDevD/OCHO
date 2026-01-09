# 🚀 OCHO API - Guide de Démarrage Rapide

## ✅ État du Système

**Tous les tests API passent:**
- ✅ Health Check (GET /)
- ✅ User Registration (POST /api/auth/register)
- ✅ User Login (POST /api/auth/login)
- ✅ Get Products (GET /api/products)
- ✅ Get Categories (GET /api/products/categories/all)
- ✅ Get Clients (GET /api/clients)
- ✅ Get Commandes (GET /api/commandes)
- ✅ Dashboard Stats (GET /api/dashboard/stats)
- ✅ Dashboard Alerts (GET /api/dashboard/alertes)
- ✅ Token Verification (GET /api/auth/verify)

## 📋 Prérequis

- Node.js v14+ (testé avec v22.20.0)
- MySQL 5.7+ (port 3306)
- npm packages installés dans `backend/`
- `.env` configuré correctement

## 🔧 Configuration

Vérifiez que `backend/.env` contient:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ocho_db
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
```

## ▶️ Démarrage du Serveur

### Option 1: Mode Production (Recommandé)

Double-cliquez sur `start-server.bat`

Le serveur démarre sur **http://localhost:5000**

### Option 2: Depuis PowerShell

```powershell
$cwd = (Resolve-Path "C:\Users\salah\OneDrive\Desktop\OCHO\backend").Path
Set-Location $cwd
node server-prod.js
```

### Option 3: Depuis CMD

```cmd
cd C:\Users\salah\OneDrive\Desktop\OCHO\backend
node server-prod.js
```

## 🧪 Tester les APIs

Lancez le script de test:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\salah\OneDrive\Desktop\OCHO\test-api-suite.ps1"
```

## 📊 Points de terminaison de l'API

### Authentication
- `POST /api/auth/register` - Créer un utilisateur
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/verify` - Vérifier le token

### Produits
- `GET /api/products` - Lister les produits
- `GET /api/products/:id` - Obtenir un produit
- `POST /api/products` - Créer un produit (Admin/Magasinier)
- `PUT /api/products/:id` - Modifier un produit (Admin/Magasinier)
- `DELETE /api/products/:id` - Supprimer un produit (Admin)
- `GET /api/products/categories/all` - Lister les catégories

### Clients
- `GET /api/clients` - Lister les clients
- `GET /api/clients/:id` - Obtenir un client
- `POST /api/clients` - Créer un client
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client

### Commandes
- `GET /api/commandes` - Lister les commandes
- `GET /api/commandes/:id` - Obtenir une commande
- `POST /api/commandes` - Créer une commande
- `POST /api/commandes/:id/valider` - Valider une commande
- `PUT /api/commandes/:id/statut` - Changer le statut

### Dashboard
- `GET /api/dashboard/stats` - Obtenir les statistiques
- `GET /api/dashboard/alertes` - Obtenir les alertes

## 🔐 Authentification

Tous les endpoints (sauf register/login) nécessitent un token JWT dans le header:
```
Authorization: Bearer <token>
```

## 📝 Exemple de Requête

### 1. Enregistrement
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test User",
    "email": "test@example.com",
    "mot_de_passe": "Password123!",
    "role_id": 3
  }'
```

### 2. Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 3. Utiliser le Token
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer <your_token>"
```

## 🐛 Résolution de Problèmes

### Le serveur ne démarre pas
- Vérifiez que le port 5000 n'est pas en utilisation
- Vérifiez que MySQL est démarré
- Vérifiez la configuration dans `backend/.env`

### Erreur de connexion DB
- Vérifiez que MySQL écoute sur le port 3306
- Vérifiez les identifiants dans `.env`
- Vérifiez que la base de données `ocho_db` existe

### Erreur lors des requêtes API
- Vérifiez que vous utilisez le bon token JWT
- Vérifiez que le token n'a pas expiré (24h)
- Vérifiez que votre utilisateur a les bons rôles

## 📚 Documentation Complète

Voir les fichiers de documentation:
- `ARCHITECTURE.md` - Architecture système
- `FIXES_APPORTEES.md` - Détails des corrections apportées
- `GUIDE_CURL.md` - Exemples de commandes curl

## ✨ Prochaines Étapes

1. Créer les pages frontend (dashboard.html, products.html, etc.)
2. Intégrer les appels API dans les pages frontend
3. Tester le flux complet utilisateur
4. Mettre en place le monitoring et les logs

---

**Serveur OCHO v1.0.0 - 2026**
