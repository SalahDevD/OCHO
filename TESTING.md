## 🧪 Guide de Test de l'API OCHO

### Utiliser Postman ou cURL

#### 1. **Connexion (Obtenir le Token)**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ocho.com",
    "password": "admin123"
  }'
```

**Réponse réussie:**
```json
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

Copier la valeur du `token`.

#### 2. **Vérifier le Token**

```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 3. **Créer un Produit**

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "PROD001",
    "nom": "T-Shirt Coton",
    "categorie_id": 1,
    "genre": "Unisexe",
    "saison": "Toute saison",
    "prix_achat": 5.50,
    "prix_vente": 15.00,
    "seuil_min": 10,
    "variantes": [
      {
        "taille": "S",
        "couleur": "Blanc",
        "quantite": 50
      },
      {
        "taille": "M",
        "couleur": "Noir",
        "quantite": 75
      }
    ]
  }'
```

#### 4. **Lister les Produits**

```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. **Créer un Client**

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "06 12 34 56 78",
    "adresse": "123 Rue de la Paix, 75000 Paris"
  }'
```

#### 6. **Créer une Commande**

```bash
curl -X POST http://localhost:3000/api/commandes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "articles": [
      {
        "variante_id": 1,
        "quantite": 2,
        "prix_unitaire": 15.00
      },
      {
        "variante_id": 2,
        "quantite": 1,
        "prix_unitaire": 15.00
      }
    ]
  }'
```

#### 7. **Valider une Commande**

```bash
curl -X PUT http://localhost:3000/api/commandes/1/valider \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### 8. **Modifier le Statut d'une Commande**

```bash
curl -X PUT http://localhost:3000/api/commandes/1/statut \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "Livrée"
  }'
```

Statuts valides: `En attente`, `Validée`, `En cours`, `Livrée`, `Annulée`

#### 9. **Obtenir les Statistiques du Dashboard**

```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 10. **Obtenir les Alertes**

```bash
curl -X GET http://localhost:3000/api/dashboard/alertes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ✅ Checklist Fonctionnelle

- [ ] Connexion réussie avec récupération du token
- [ ] Vérification du token fonctionnelle
- [ ] Création de produit avec variantes
- [ ] Listing des produits
- [ ] Création de client
- [ ] Création de commande
- [ ] Validation de commande
- [ ] Modification de statut
- [ ] Affichage des statistiques
- [ ] Affichage des alertes

### 🐛 Debugging

Pour voir les logs détaillés du serveur, vérifiez la console du terminal où Express est en cours d'exécution.

Pour voir les détails des requêtes en JavaScript (frontend):
```javascript
// Ouvrir la console du navigateur (F12)
// Vérifier l'onglet "Network" pour les requêtes
// Vérifier l'onglet "Console" pour les erreurs
// Vérifier "Application" -> "Local Storage" pour le token
```

### 📊 Exemple de Réponse Complète

Après créer un produit et obtenir les statistiques:

```json
{
  "success": true,
  "stats": {
    "total_produits": 1,
    "total_clients": 1,
    "stock_total": 125
  }
}
```

Cela signifie:
- 1 produit créé
- 1 client enregistré
- 125 articles en stock au total (50 + 75 des variantes)
