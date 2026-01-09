# 🧪 GUIDE COMPLET DES TESTS API - cURL

**Adresse API:** `http://localhost:3000`

---

## 1️⃣ AUTHENTIFICATION

### Login (Obtenir un TOKEN)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ocho.com",
    "password": "admin123"
  }'
```

**Réponse:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "Administrateur OCHO",
    "email": "admin@ocho.com",
    "role": "Administrateur"
  }
}
```

### Vérifier le Token
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

### S'inscrire (Créer un utilisateur)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Nouveau Vendeur",
    "email": "vendeur@ocho.com",
    "mot_de_passe": "password123",
    "role_id": 3
  }'
```

---

## 2️⃣ PRODUITS

### Lister tous les produits
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Obtenir un produit par ID
```bash
curl http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Lister les catégories
```bash
curl http://localhost:3000/api/products/categories/all \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un produit
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "reference": "PROD-NEW-001",
    "nom": "T-Shirt New Collection",
    "categorie_id": 1,
    "genre": "Unisexe",
    "saison": "Été",
    "prix_achat": 50.00,
    "prix_vente": 99.99,
    "seuil_min": 15,
    "variantes": [
      { "taille": "S", "couleur": "Bleu", "quantite": 10 },
      { "taille": "M", "couleur": "Bleu", "quantite": 15 },
      { "taille": "L", "couleur": "Bleu", "quantite": 20 }
    ]
  }'
```

### Modifier un produit
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "T-Shirt Updated Name",
    "prix_vente": 109.99,
    "seuil_min": 20
  }'
```

### Supprimer un produit
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3️⃣ CLIENTS

### Lister tous les clients
```bash
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer $TOKEN"
```

### Obtenir un client par ID
```bash
curl http://localhost:3000/api/clients/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "0612345678",
    "adresse": "123 Rue de la Paix",
    "ville": "Paris",
    "code_postal": "75001"
  }'
```

### Modifier un client
```bash
curl -X PUT http://localhost:3000/api/clients/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "telephone": "0698765432",
    "adresse": "456 Avenue des Champs"
  }'
```

### Supprimer un client
```bash
curl -X DELETE http://localhost:3000/api/clients/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4️⃣ COMMANDES

### Lister toutes les commandes
```bash
curl http://localhost:3000/api/commandes \
  -H "Authorization: Bearer $TOKEN"
```

### Obtenir une commande par ID
```bash
curl http://localhost:3000/api/commandes/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Créer une commande
```bash
curl -X POST http://localhost:3000/api/commandes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": 1,
    "articles": [
      {
        "variante_id": 1,
        "produit_id": 1,
        "quantite": 2,
        "prix_unitaire": 89.00
      },
      {
        "variante_id": 24,
        "produit_id": 4,
        "quantite": 1,
        "prix_unitaire": 299.00
      }
    ],
    "notes": "À livrer avant 17h"
  }'
```

### Valider une commande
```bash
curl -X PUT http://localhost:3000/api/commandes/1/valider \
  -H "Authorization: Bearer $TOKEN"
```

### Changer le statut d'une commande
```bash
curl -X PUT http://localhost:3000/api/commandes/1/statut \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "statut": "Livrée"
  }'
```

**Statuts valides:** `Créée`, `Validée`, `En cours`, `Livrée`, `Annulée`

---

## 5️⃣ DASHBOARD

### Obtenir les statistiques
```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Réponse:**
```json
{
  "success": true,
  "stats": {
    "total_produits": 13,
    "total_clients": 5,
    "valeur_stock": 12500.00,
    "commandes_mois": 4,
    "ca_mois": 2400.00,
    "stock_total": 450,
    "produits_stock_faible": 2,
    "top_produits": [...],
    "commandes_recentes": [...]
  }
}
```

### Obtenir les alertes (stock faible)
```bash
curl http://localhost:3000/api/dashboard/alertes \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔑 VARIABLES IMPORTANTES

**Enregistrer le token dans une variable:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ocho.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

**IDs par défaut après init.sql:**
- Produit 1: T-Shirt Col Rond Basique
- Variante 1: T-Shirt Blanc S
- Client 1: Alami Mohammed
- Commande 1: CMD-2026-001

---

## ⚠️ CODES D'ERREUR

| Code | Signification |
|------|--------------|
| 200 | ✅ Succès |
| 201 | ✅ Créé avec succès |
| 400 | ❌ Demande invalide (données manquantes/incorrectes) |
| 401 | ❌ Non authentifié (token manquant/invalide) |
| 403 | ❌ Accès non autorisé (rôle insuffisant) |
| 404 | ❌ Ressource non trouvée |
| 500 | ❌ Erreur serveur |

---

## 💡 CONSEILS

1. **Toujours utiliser `-H "Content-Type: application/json"`** pour les requêtes POST/PUT

2. **Toujours inclure le token** dans les headers:
   ```bash
   -H "Authorization: Bearer $TOKEN"
   ```

3. **Formater la réponse JSON** avec `jq`:
   ```bash
   curl ... | jq '.'
   ```

4. **Sauvegarder le token** pour plusieurs requêtes:
   ```bash
   TOKEN="..."
   curl ... -H "Authorization: Bearer $TOKEN"
   ```

5. **Tester sans token** pour vérifier que l'authentification fonctionne:
   ```bash
   curl http://localhost:3000/api/products
   # Doit retourner: {"success":false,"message":"Token manquant"}
   ```

---

## 📋 CHECKLIST COMPLÈTE

- [ ] Login avec admin@ocho.com / admin123
- [ ] Récupérer le token
- [ ] Lister les produits avec token
- [ ] Lister les catégories
- [ ] Lister les clients
- [ ] Lister les commandes
- [ ] Vérifier le dashboard/stats
- [ ] Vérifier le dashboard/alertes
- [ ] Créer un nouveau client
- [ ] Créer une nouvelle commande
- [ ] Valider une commande
- [ ] Changer le statut
- [ ] Modifier un produit
- [ ] Modifier un client
- [ ] Tester sans token (doit retourner 401)

---

**Date:** 5 Janvier 2026  
**Version:** 1.0.0  
**Statut:** ✅ Testé et Validé

