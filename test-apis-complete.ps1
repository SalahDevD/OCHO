# Script complet pour tester les APIs
$baseUrl = "http://localhost:3000"

# Couleurs pour l'output
$green = [System.ConsoleColor]::Green
$red = [System.ConsoleColor]::Red
$yellow = [System.ConsoleColor]::Yellow

Write-Host ("=" * 60) -ForegroundColor $yellow
Write-Host "TEST DES APIS OCHO" -ForegroundColor $yellow
Write-Host ("=" * 60) -ForegroundColor $yellow

# 1. Tester le serveur
Write-Host "`n1️⃣  Test du serveur (GET /)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "✅ Serveur responsive" -ForegroundColor $green
    Write-Host "   Message: $($response.message)" -ForegroundColor $green
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
    exit 1
}

# 2. Test de la connexion DB
Write-Host "`n2️⃣  Test de connexion DB (GET /api/test-db)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/test-db" -Method GET
    if ($response.success) {
        Write-Host "✅ DB connectée" -ForegroundColor $green
        Write-Host "   Total produits: $($response.total_produits)" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur DB: $($response.error)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
}

# 3. Enregistrement (POST /api/auth/register)
Write-Host "`n3️⃣  Enregistrement d'un utilisateur (POST /api/auth/register)" -ForegroundColor $yellow
$timestamp = [System.DateTime]::Now.ToString("yyyyMMddHHmmss")
$testEmail = "test_$timestamp@ocho.test"

$registerBody = @{
    nom = "Test User"
    email = $testEmail
    mot_de_passe = "TestPassword123!"
    role_id = 3  # Vendeur
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    if ($response.success) {
        Write-Host "✅ Utilisateur créé" -ForegroundColor $green
        Write-Host "   Email: $testEmail" -ForegroundColor $green
        Write-Host "   User ID: $($response.userId)" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
    exit 1
}

# 4. Connexion (POST /api/auth/login)
Write-Host "`n4️⃣  Connexion (POST /api/auth/login)" -ForegroundColor $yellow
$loginBody = @{
    email = $testEmail
    password = "TestPassword123!"
} | ConvertTo-Json

$token = $null
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    if ($response.success) {
        Write-Host "✅ Connexion réussie" -ForegroundColor $green
        Write-Host "   User: $($response.user.nom) ($($response.user.role))" -ForegroundColor $green
        $token = $response.token
        Write-Host "   Token obtenu (${$token.Length} chars)" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
    exit 1
}

# Configuration du header Authorization
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 5. Test des produits (GET /api/products)
Write-Host "`n5️⃣  Récupérer les produits (GET /api/products)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -Headers $headers
    if ($response.success) {
        Write-Host "✅ Produits récupérés" -ForegroundColor $green
        $count = ($response.products | Measure-Object).Count
        Write-Host "   Total: $count produits" -ForegroundColor $green
        if ($response.products.Count -gt 0) {
            Write-Host "   Premier produit: $($response.products[0].nom)" -ForegroundColor $green
        }
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
}

# 6. Test des catégories (GET /api/products/categories/all)
Write-Host "`n6️⃣  Récupérer les catégories (GET /api/products/categories/all)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products/categories/all" -Method GET -Headers $headers
    if ($response.success) {
        Write-Host "✅ Catégories récupérées" -ForegroundColor $green
        $count = ($response.categories | Measure-Object).Count
        Write-Host "   Total: $count catégories" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
}

# 7. Test des clients (GET /api/clients)
Write-Host "`n7️⃣  Récupérer les clients (GET /api/clients)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/clients" -Method GET -Headers $headers
    if ($response.success) {
        Write-Host "✅ Clients récupérés" -ForegroundColor $green
        $count = ($response.clients | Measure-Object).Count
        Write-Host "   Total: $count clients" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
}

# 8. Test des commandes (GET /api/commandes)
Write-Host "`n8️⃣  Récupérer les commandes (GET /api/commandes)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/commandes" -Method GET -Headers $headers
    if ($response.success) {
        Write-Host "✅ Commandes récupérées" -ForegroundColor $green
        $count = ($response.commandes | Measure-Object).Count
        Write-Host "   Total: $count commandes" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
}

# 9. Test du dashboard (GET /api/dashboard/stats)
Write-Host "`n9️⃣  Récupérer les stats (GET /api/dashboard/stats)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/stats" -Method GET -Headers $headers
    if ($response.success) {
        Write-Host "✅ Stats récupérées" -ForegroundColor $green
        Write-Host "   Produits: $($response.stats.total_produits)" -ForegroundColor $green
        Write-Host "   Clients: $($response.stats.total_clients)" -ForegroundColor $green
        Write-Host "   CA mois: $($response.stats.ca_mois)" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
}

# 10. Test des alertes (GET /api/dashboard/alertes)
Write-Host "`n🔟 Récupérer les alertes (GET /api/dashboard/alertes)" -ForegroundColor $yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/alertes" -Method GET -Headers $headers
    if ($response.success) {
        Write-Host "✅ Alertes récupérées" -ForegroundColor $green
        $count = ($response.alertes | Measure-Object).Count
        Write-Host "   Total: $count alertes" -ForegroundColor $green
    } else {
        Write-Host "❌ Erreur: $($response.message)" -ForegroundColor $red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor $red
}

Write-Host ("`n" + ("=" * 60)) -ForegroundColor $yellow
Write-Host "TEST COMPLET" -ForegroundColor $green
Write-Host ("=" * 60) -ForegroundColor $yellow
