#!/bin/bash
# Script de test de l'API OCHO
# Utilisation: bash test-api.sh

API="http://localhost:3000/api"
TIMESTAMP=$(date +%s)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTS API OCHO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Connexion
echo ""
echo "1️⃣ Test Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ocho.com",
    "password": "admin123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

# Extraire le token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Impossible d'obtenir le token. Vérifiez la BD."
  exit 1
fi

echo "✅ Token obtenu: ${TOKEN:0:50}..."

# Test 2: Vérifier le token
echo ""
echo "2️⃣ Test Verify Token..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/auth/verify" | jq '.'

# Test 3: Lister les produits
echo ""
echo "3️⃣ Test Get Products..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/products" | jq '.products | length'

# Test 4: Lister les catégories
echo ""
echo "4️⃣ Test Get Categories..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/products/categories/all" | jq '.'

# Test 5: Lister les clients
echo ""
echo "5️⃣ Test Get Clients..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/clients" | jq '.clients | length'

# Test 6: Lister les commandes
echo ""
echo "6️⃣ Test Get Commandes..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/commandes" | jq '.'

# Test 7: Dashboard Stats
echo ""
echo "7️⃣ Test Dashboard Stats..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/dashboard/stats" | jq '.'

# Test 8: Alertes
echo ""
echo "8️⃣ Test Alertes..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/dashboard/alertes" | jq '.'

# Test 9: Créer un client
echo ""
echo "9️⃣ Test Create Client..."
NEW_CLIENT=$(curl -s -X POST "$API/clients" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"nom\": \"TestClient\",
    \"prenom\": \"Test\",
    \"email\": \"test$TIMESTAMP@email.com\",
    \"telephone\": \"0600000000\",
    \"adresse\": \"123 Rue de Test\",
    \"ville\": \"Test City\",
    \"code_postal\": \"75000\"
  }")

echo "$NEW_CLIENT" | jq '.'
CLIENT_ID=$(echo "$NEW_CLIENT" | jq -r '.clientId')

# Test 10: Créer une commande
echo ""
echo "🔟 Test Create Commande..."
NEW_COMMANDE=$(curl -s -X POST "$API/commandes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"client_id\": $CLIENT_ID,
    \"articles\": [
      {
        \"variante_id\": 1,
        \"produit_id\": 1,
        \"quantite\": 2,
        \"prix_unitaire\": 89.00
      }
    ],
    \"notes\": \"Commande de test\"
  }")

echo "$NEW_COMMANDE" | jq '.'
COMMANDE_ID=$(echo "$NEW_COMMANDE" | jq -r '.commandeId')

# Test 11: Valider la commande
echo ""
echo "1️⃣1️⃣ Test Valider Commande..."
curl -s -X PUT "$API/commandes/$COMMANDE_ID/valider" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test 12: Changer le statut
echo ""
echo "1️⃣2️⃣ Test Update Statut Commande..."
curl -s -X PUT "$API/commandes/$COMMANDE_ID/statut" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "statut": "Livrée"
  }' | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TESTS TERMINÉS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
