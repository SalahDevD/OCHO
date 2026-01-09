# Test simple des APIs OCHO
$baseUrl = "http://localhost:3000"

Write-Host "========== TEST DES APIS OCHO ==========" -ForegroundColor Cyan

# Test 1: Serveur
Write-Host "`nTest 1: GET /" -ForegroundColor Yellow
$r1 = Invoke-RestMethod -Uri "$baseUrl/" -Method GET -ErrorAction SilentlyContinue
if ($r1) { Write-Host "OK - $($r1.message)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 2: Test DB
Write-Host "`nTest 2: GET /api/test-db" -ForegroundColor Yellow
$r2 = Invoke-RestMethod -Uri "$baseUrl/api/test-db" -Method GET -ErrorAction SilentlyContinue
if ($r2 -and $r2.success) { Write-Host "OK - Produits: $($r2.total_produits)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 3: Register
Write-Host "`nTest 3: POST /api/auth/register" -ForegroundColor Yellow
$ts = Get-Date -Format "yyyyMMddHHmmss"
$body = @{ nom="Test"; email="test_$ts@test.com"; mot_de_passe="Pass123!"; role_id=3 } | ConvertTo-Json
$r3 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
if ($r3 -and $r3.success) { Write-Host "OK - User ID: $($r3.userId)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 4: Login
Write-Host "`nTest 4: POST /api/auth/login" -ForegroundColor Yellow
$body = @{ email="test_$ts@test.com"; password="Pass123!" } | ConvertTo-Json
$r4 = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
if ($r4 -and $r4.success) { 
  Write-Host "OK - User: $($r4.user.nom), Token: $($r4.token.Substring(0,20))..." -ForegroundColor Green
  $token = $r4.token
} else { 
  Write-Host "FAILED" -ForegroundColor Red
}

$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# Test 5: Products
Write-Host "`nTest 5: GET /api/products (with token)" -ForegroundColor Yellow
$r5 = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method GET -Headers $headers -ErrorAction SilentlyContinue
if ($r5 -and $r5.success) { Write-Host "OK - Products: $($r5.products.Count)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 6: Categories
Write-Host "`nTest 6: GET /api/products/categories/all" -ForegroundColor Yellow
$r6 = Invoke-RestMethod -Uri "$baseUrl/api/products/categories/all" -Method GET -Headers $headers -ErrorAction SilentlyContinue
if ($r6 -and $r6.success) { Write-Host "OK - Categories: $($r6.categories.Count)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 7: Clients
Write-Host "`nTest 7: GET /api/clients" -ForegroundColor Yellow
$r7 = Invoke-RestMethod -Uri "$baseUrl/api/clients" -Method GET -Headers $headers -ErrorAction SilentlyContinue
if ($r7 -and $r7.success) { Write-Host "OK - Clients: $($r7.clients.Count)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 8: Commandes
Write-Host "`nTest 8: GET /api/commandes" -ForegroundColor Yellow
$r8 = Invoke-RestMethod -Uri "$baseUrl/api/commandes" -Method GET -Headers $headers -ErrorAction SilentlyContinue
if ($r8 -and $r8.success) { Write-Host "OK - Commandes: $($r8.commandes.Count)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 9: Dashboard stats
Write-Host "`nTest 9: GET /api/dashboard/stats" -ForegroundColor Yellow
$r9 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/stats" -Method GET -Headers $headers -ErrorAction SilentlyContinue
if ($r9 -and $r9.success) { Write-Host "OK - Stats retrieved" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

# Test 10: Dashboard alertes
Write-Host "`nTest 10: GET /api/dashboard/alertes" -ForegroundColor Yellow
$r10 = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/alertes" -Method GET -Headers $headers -ErrorAction SilentlyContinue
if ($r10 -and $r10.success) { Write-Host "OK - Alertes: $($r10.alertes.Count)" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

Write-Host "`n========== TEST COMPLETE ==========" -ForegroundColor Cyan
