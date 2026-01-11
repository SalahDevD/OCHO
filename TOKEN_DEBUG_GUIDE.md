# 🔐 Guide de Dépannage - Erreur 401 Unauthorized

## 📋 Résumé du Problème

**Erreur:** `401 Unauthorized - Token invalide ou expiré`

Cette erreur signifie que:
- ❌ La requête API n'inclut pas un token valide
- ❌ Le token n'a pas été stocké après la connexion
- ❌ Le token est expiré (durée de vie > 24h)
- ❌ Mismatch entre le JWT_SECRET utilisé pour créer et vérifier le token

---

## 🔍 Étapes de Diagnostic

### Étape 0: Vérifier l'Origine et CORS

Ouvrez **DevTools → Console** et vérifiez:

```javascript
console.log(window.location.origin)  // Doit être http://localhost:5000
console.log(window.location.href)    // URL complète
```

**Problèmes courants:**
- ❌ `file://` → Frontend ouvert comme fichier local
- ❌ `http://127.0.0.1:5000` → Utilisé 127.0.0.1 au lieu de localhost
- ❌ `null` → Origine non définie (fichier local ou iframe)

**Solution:** Toujours accéder via `http://localhost:5000`, pas `file://`
Quand vous recevez l'erreur 401, regardez les logs du serveur (terminal Node.js):

```
🔐 Auth Middleware - Header: PRESENT/MISSING
🔐 JWT_SECRET: SET/NOT_SET
❌ Token manquant ou format invalide
🔑 Token reçu: xxxxx...
✅ Token valide pour: email@example.com
```

**Interprétation:**
- Si `Header: MISSING` → Le token n'est pas envoyé par le frontend
- Si `JWT_SECRET: NOT_SET` → Vérifier le fichier `.env`
- Si `Token invalide` → Le token a expiré ou est corrompu

### Étape 2: Vérifier LocalStorage

Ouvrez les **DevTools du navigateur** (F12):
```javascript
// Dans la console, exécutez:
localStorage.getItem('token')  // Doit retourner un long string JWT
localStorage.getItem('user')   // Doit retourner un JSON avec user info
```

**Résultats attendus:**
```javascript
// Token (exemple)
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi..."

// User (exemple)
{"id":1,"nom":"Admin","email":"admin@ocho.com","role":"Administrateur"}
```

**Si vide (null):**
- ❌ La connexion n'a pas sauvegardé les données
- ❌ Vérifier la réponse de `/auth/login`

### Étape 3: Vérifier la Requête Login

Allez dans DevTools → **Network** → **Fetch/XHR**:

1. Connectez-vous
2. Cliquez sur `POST /api/auth/login`
3. Vérifiez la **Response**:

```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "nom": "Admin",
    "email": "admin@ocho.com",
    "role": "Administrateur"
  }
}
```

**Problèmes possibles:**
- ❌ `success: false` → Email/Password incorrect
- ❌ Pas de `token` dans la réponse → Bug dans authController.js
- ❌ Erreur HTTP 500 → Problème base de données

### Étape 4: Vérifier l'Envoi du Token

En attendant une requête API (ex: GET `/api/clients`), regardez le **Request Headers**:

```
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
```

**Si Authorization est absent:**
- ❌ `getToken()` retourne null
- ❌ Le token n'est pas dans localStorage

---

## 🛠️ Solutions Rapides

### ✅ Solution 1: Effacer et Reconnecter

```javascript
// Console DevTools:
localStorage.clear()  // Effacer tout
```

Puis:
1. Recharger la page
2. Se reconnecter
3. Vérifier que le token est sauvegardé

### ✅ Solution 2: Vérifier .env

Fichier: `backend/.env`

```dotenv
JWT_SECRET=ocho_secret_jwt_2026_change_me_in_production
JWT_EXPIRE=24h
```

**Important:**
- Ne pas laisser `JWT_SECRET` vide
- Toutes les instances du serveur doivent avoir la MÊME clé

### ✅ Solution 3: Redémarrer le Serveur

Après modification de `.env`:

```bash
# Terminal backend
Ctrl+C  # Arrêter le serveur actuel
node server.js  # Redémarrer
```

### ✅ Solution 4: Utiliser l'Outil de Debug

Accédez à: `http://localhost:5000/debug-token.html`

Cet outil vous permet de:
- ✅ Vérifier LocalStorage
- ✅ Décoder le JWT
- ✅ Tester la connexion
- ✅ Vérifier la validité du token

---

## 📊 Vérifier la Validité du Token JWT

### Décoder le JWT

```javascript
// Dans Console DevTools:
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
```

**Résultat attendu:**
```javascript
{
  id: 1,
  email: "admin@ocho.com",
  role: "Administrateur",
  iat: 1704805200,
  exp: 1704891600
}
```

### Vérifier l'Expiration

```javascript
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
const expDate = new Date(payload.exp * 1000);
console.log('Expire le:', expDate);
console.log('Expiré?:', expDate < new Date());
```

---

## 🔧 Flux de Connexion Détaillé

```
1. User rentre email/password
   ↓
2. Frontend appelle POST /api/auth/login
   ↓
3. Backend valide email + password
   ↓
4. Backend génère JWT avec JWT_SECRET
   ↓
5. Backend retourne {token, user}
   ↓
6. Frontend sauvegarde token dans localStorage
   ↓
7. Frontend redirige vers dashboard
   ↓
8. Dashboard envoie GET /api/clients
   ↓
9. Frontend envoie Authorization: Bearer {token}
   ↓
10. Middleware vérifie JWT avec JWT_SECRET
   ↓
11. Si valide → Requête acceptée ✅
    Si invalide → Erreur 401 ❌
```

---

## 📋 Checklist de Débogage

- [ ] Serveur Node.js est-il en cours d'exécution?
- [ ] `.env` existe-t-il avec `JWT_SECRET` défini?
- [ ] Le token est-il sauvegardé dans localStorage après connexion?
- [ ] Le token est-il envoyé dans le header `Authorization`?
- [ ] Le JWT_SECRET est-il identique sur le serveur?
- [ ] Le token n'a-t-il pas expiré (> 24h)?
- [ ] CORS est-il correctement configuré?
- [ ] La base de données contient-elle un utilisateur avec l'email de test?

---

## 🆘 Si Rien Ne Marche

1. **Ouvrir DevTools (F12)**
2. **Aller dans Console**
3. **Exécuter:**
   ```javascript
   console.log({
     token: localStorage.getItem('token'),
     user: localStorage.getItem('user'),
     isAuthenticated: localStorage.getItem('token') !== null
   })
   ```
4. **Regarder Network Tab** lors de la tentative de login
5. **Vérifier les logs serveur** pour les messages d'erreur
6. **Redémarrer le serveur** et essayer à nouveau

---

## 📞 Messages d'Erreur Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| 401 Unauthorized | Token invalide/expiré | Reconnecter |
| 401 - Token manquant | Pas d'Authorization header | Vérifier localStorage |
| 500 - JWT malformed | Token corrompu | Effacer localStorage |
| 500 - Invalid signature | JWT_SECRET différent | Redémarrer serveur |
| 403 Forbidden | Rôle insuffisant | Utiliser compte admin |
| **CORS - Origin 'null'** | Frontend ouvert en local (file://) | Accéder via http://localhost:5000 |
| **CORS - Header mismatch** | Origine différente de celle permise | Vérifier corsOptions dans server.js |
| **CORS - Preflight failed** | Méthode/header non autorisée | Ajouter à corsOptions |

---

## 🌐 Erreurs CORS (Cross-Origin)

### Erreur: "Origin 'null' not allowed by Access-Control-Allow-Origin"

**Cause:** Vous accédez au frontend depuis `file://` au lieu de `http://localhost:5000`

**Solution:**
```bash
# ❌ MAUVAIS - Ne pas faire:
file:///c:/Users/.../OCHO/frontend/index.html

# ✅ BON - Faire:
http://localhost:5000/index.html
```

Le serveur sert automatiquement le frontend sur `http://localhost:5000`. Accédez toujours par cette URL.

### Vérifier votre Origine dans la Console:

```javascript
// Console Browser DevTools (F12):
console.log({
  origin: window.location.origin,
  href: window.location.href,
  protocol: window.location.protocol,
  host: window.location.host
})
```

**Résultat attendu:**
```javascript
{
  origin: "http://localhost:5000",
  href: "http://localhost:5000/pages/dashboard.html",
  protocol: "http:",
  host: "localhost:5000"
}
```

### Erreur: "Preflight request doesn't pass access control check"

**Cause:** Headers ou méthode HTTP non autorisés

**Vérification:**
1. Allez dans **DevTools → Network**
2. Cherchez une requête `OPTIONS` avant votre requête
3. Vérifiez les headers de réponse:
   ```
   Access-Control-Allow-Origin: http://localhost:5000
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

**Si absent:** Redémarrez le serveur avec la nouvelle config CORS

---

```bash
# Voir les processus Node
Get-Process node

# Arrêter tous les Node
Get-Process node | Stop-Process -Force

# Redémarrer serveur
cd backend
node server.js

# Vérifier connexion DB
curl http://localhost:5000/api/test-db

# Vérifier endpoint API
curl http://localhost:5000/api
```

---

## 📞 Support

Si l'erreur persiste après tous ces tests, vérifiez:

1. Les logs détaillés dans le terminal serveur
2. La console du navigateur pour les erreurs JavaScript
3. L'onglet Network pour voir les requêtes/réponses exactes
4. Utilisez `/debug-token.html` pour un diagnostic complet
