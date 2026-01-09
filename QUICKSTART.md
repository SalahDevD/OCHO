# 🚀 OCHO - Guide de Démarrage Rapide

## ⚡ 5 Minutes pour Démarrer

### Étape 1: Préparer la Base de Données

**Option A - Via phpMyAdmin (Recommandé)**
1. Ouvrez http://localhost/phpmyadmin
2. Créez une nouvelle BD: `ocho_db`
3. Allez dans "Importer" → Sélectionnez `backend/config/init.sql`
4. Cliquez "Exécuter"

**Option B - Via Ligne de Commande**
```bash
mysql -u root -p < backend/config/init.sql
```

### Étape 2: Installer les Dépendances

```bash
cd backend
npm install
```

### Étape 3: Démarrer le Serveur

```bash
npm start
```

Vous devriez voir:
```
═══════════════════════════════════════
🚀 Serveur OCHO démarré avec succès!
═══════════════════════════════════════
📍 URL: http://localhost:3000
📊 Base de données: ocho_db
🔐 Mode: development
═══════════════════════════════════════
```

### Étape 4: Tester l'API

```bash
curl http://localhost:3000/
```

Vous devriez recevoir un JSON avec les endpoints disponibles.

### Étape 5: Se Connecter

**Identifiants par défaut:**
- Email: `admin@ocho.com`
- Mot de passe: `admin123`

**Tester la connexion:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ocho.com","password":"admin123"}'
```

---

## 🌐 Accéder à l'Application Frontend

Ouvrez votre navigateur:
```
http://localhost/OCHO/frontend/
```

Ou si XAMPP n'est pas configuré, ouvrez directement:
```
file:///c:/Users/salah/OneDrive/Desktop/OCHO/frontend/index.html
```

---

## 📚 Documentation Complète

- **[README.md](./README.md)** - Guide complet d'installation
- **[TESTING.md](./TESTING.md)** - Tests API avec exemples cURL
- **[CORRECTIONS.md](./CORRECTIONS.md)** - Résumé des corrections
- **[init.sql](./backend/config/init.sql)** - Schéma base de données

---

## ✅ Vérification

Vérifiez que tout fonctionne:

```bash
# 1. Test de la BD
curl http://localhost:3000/api/test-db

# 2. Test de la connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ocho.com","password":"admin123"}'

# 3. Copier le token reçu et tester:
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 🐛 Problèmes?

| Problème | Solution |
|----------|----------|
| Port 3000 utilisé | Changer `PORT` dans `.env` |
| Erreur BD | Vérifier MySQL actif et données `.env` |
| Token manquant | Se connecter d'abord (step 5) |
| Module not found | Faire `npm install` dans `backend/` |

---

## 📝 Notes Importantes

- Le fichier `.env` contient les paramètres de connexion
- Ne commitez JAMAIS le `.env` en production
- Modifier `JWT_SECRET` avant la mise en ligne
- Les mots de passe sont hashés avec bcrypt

---

**Prêt à développer! 🎉**
