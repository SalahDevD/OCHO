# Script de test de l'API OCHO - PowerShell
# Utilisation: powershell -ExecutionPolicy Bypass -File test-api.ps1

$API = "http://localhost:3000/api"
$TIMESTAMP = Get-Date -UFormat %s

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 TESTS API OCHO" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Test 1: Login
Write-Host ""
Write-Host "1️⃣ Test Login..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@ocho.com"
    password = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$API/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginData

$loginResponse | ConvertTo-Json | Write-Host

$TOKEN = $loginResponse.token

if (!$TOKEN) {
    Write-Host "❌ Impossible d'obtenir le token. Vérifiez la BD." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token obtenu: $($TOKEN.Substring(0, 50))..." -ForegroundColor Green

# Test 2: Verify Token
Write-Host ""
Write-Host "2️⃣ Test Verify Token..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $TOKEN"
}

$verifyResponse = Invoke-RestMethod -Uri "$API/auth/verify" `
    -Method GET `
    -Headers $headers

$verifyResponse | ConvertTo-Json | Write-Host

# Test 3: Get Products
Write-Host ""
Write-Host "3️⃣ Test Get Products..." -ForegroundColor Yellow

$productsResponse = Invoke-RestMethod -Uri "$API/products" `
    -Method GET `
    -Headers $headers

Write-Host "Total produits: $($productsResponse.products.Count)" -ForegroundColor Green

# Test 4: Get Categories
Write-Host ""
Write-Host "4️⃣ Test Get Categories..." -ForegroundColor Yellow

$categoriesResponse = Invoke-RestMethod -Uri "$API/products/categories/all" `
    -Method GET `
    -Headers $headers

$categoriesResponse | ConvertTo-Json | Write-Host

# Test 5: Get Clients
Write-Host ""
Write-Host "5️⃣ Test Get Clients..." -ForegroundColor Yellow

$clientsResponse = Invoke-RestMethod -Uri "$API/clients" `
    -Method GET `
    -Headers $headers

Write-Host "Total clients: $($clientsResponse.clients.Count)" -ForegroundColor Green

# Test 6: Get Commandes
Write-Host ""
Write-Host "6️⃣ Test Get Commandes..." -ForegroundColor Yellow

try {
    $commandesResponse = Invoke-RestMethod -Uri "$API/commandes" `
        -Method GET `
        -Headers $headers
    
    $commandesResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Erreur: $($_)" -ForegroundColor Red
}

# Test 7: Dashboard Stats
Write-Host ""
Write-Host "7️⃣ Test Dashboard Stats..." -ForegroundColor Yellow

try {
    $statsResponse = Invoke-RestMethod -Uri "$API/dashboard/stats" `
        -Method GET `
        -Headers $headers
    
    $statsResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Erreur: $($_)" -ForegroundColor Red
}

# Test 8: Alertes
Write-Host ""
Write-Host "8️⃣ Test Alertes..." -ForegroundColor Yellow

try {
    $alertesResponse = Invoke-RestMethod -Uri "$API/dashboard/alertes" `
        -Method GET `
        -Headers $headers
    
    $alertesResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Erreur: $($_)" -ForegroundColor Red
}

# Test 9: Create Client
Write-Host ""
Write-Host "9️⃣ Test Create Client..." -ForegroundColor Yellow

$newClientData = @{
    nom = "TestClient"
    prenom = "Test"
    email = "test$TIMESTAMP@email.com"
    telephone = "0600000000"
    adresse = "123 Rue de Test"
    ville = "Test City"
    code_postal = "75000"
} | ConvertTo-Json

$newClientResponse = Invoke-RestMethod -Uri "$API/clients" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $newClientData

$newClientResponse | ConvertTo-Json | Write-Host
$CLIENT_ID = $newClientResponse.clientId

# Test 10: Create Commande
Write-Host ""
Write-Host "🔟 Test Create Commande..." -ForegroundColor Yellow

$newCommandeData = @{
    client_id = $CLIENT_ID
    articles = @(
        @{
            variante_id = 1
            produit_id = 1
            quantite = 2
            prix_unitaire = 89.00
        }
    )
    notes = "Commande de test"
} | ConvertTo-Json

try {
    $newCommandeResponse = Invoke-RestMethod -Uri "$API/commandes" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $newCommandeData
    
    $newCommandeResponse | ConvertTo-Json | Write-Host
    $COMMANDE_ID = $newCommandeResponse.commandeId
    
    # Test 11: Valider Commande
    Write-Host ""
    Write-Host "1️⃣1️⃣ Test Valider Commande..." -ForegroundColor Yellow
    
    $validerResponse = Invoke-RestMethod -Uri "$API/commandes/$COMMANDE_ID/valider" `
        -Method PUT `
        -Headers $headers
    
    $validerResponse | ConvertTo-Json | Write-Host
    
    # Test 12: Update Statut
    Write-Host ""
    Write-Host "1️⃣2️⃣ Test Update Statut Commande..." -ForegroundColor Yellow
    
    $statutData = @{
        statut = "Livrée"
    } | ConvertTo-Json
    
    $statutResponse = Invoke-RestMethod -Uri "$API/commandes/$COMMANDE_ID/statut" `
        -Method PUT `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $statutData
    
    $statutResponse | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Erreur commande: $($_)" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ TESTS TERMINÉS" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
