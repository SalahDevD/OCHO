# OCHO API Test Script
$base = "http://localhost:5000"
$pass = 0
$fail = 0

Write-Host "====== OCHO API TESTS ======" -ForegroundColor Yellow

# Test 1: Root endpoint
Write-Host "`n1. Testing GET /" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/" -TimeoutSec 5
    Write-Host "✅ OK: $($r.message)" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 2: Register
Write-Host "`n2. Testing POST /api/auth/register" -ForegroundColor Cyan
$ts = Get-Date -Format "yyyyMMddHHmmss"
$email = "test_$ts@test.com"
$body = @{ nom="Test"; email=$email; mot_de_passe="Pass123!"; role_id=3 } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "$base/api/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
    Write-Host "✅ OK: User created" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 3: Login
Write-Host "`n3. Testing POST /api/auth/login" -ForegroundColor Cyan
$body = @{ email=$email; password="Pass123!" } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
    $token = $r.token
    Write-Host "✅ OK: Token obtained" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++; exit }

# Setup headers
$h = @{ "Authorization" = "Bearer $token" }

# Test 4: Products
Write-Host "`n4. Testing GET /api/products" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/api/products" -Headers $h -TimeoutSec 5
    Write-Host "✅ OK: Got products" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 5: Categories
Write-Host "`n5. Testing GET /api/products/categories/all" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/api/products/categories/all" -Headers $h -TimeoutSec 5
    Write-Host "✅ OK: Got categories" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 6: Clients
Write-Host "`n6. Testing GET /api/clients" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/api/clients" -Headers $h -TimeoutSec 5
    Write-Host "✅ OK: Got clients" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 7: Commandes
Write-Host "`n7. Testing GET /api/commandes" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/api/commandes" -Headers $h -TimeoutSec 5
    Write-Host "✅ OK: Got commandes" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 8: Dashboard Stats
Write-Host "`n8. Testing GET /api/dashboard/stats" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/api/dashboard/stats" -Headers $h -TimeoutSec 5
    Write-Host "✅ OK: Got stats" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 9: Dashboard Alertes
Write-Host "`n9. Testing GET /api/dashboard/alertes" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/api/dashboard/alertes" -Headers $h -TimeoutSec 5
    Write-Host "✅ OK: Got alertes" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

# Test 10: Verify Token
Write-Host "`n10. Testing GET /api/auth/verify" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod -Uri "$base/api/auth/verify" -Headers $h -TimeoutSec 5
    Write-Host "✅ OK: Token verified" -ForegroundColor Green
    $pass++
} catch { Write-Host "❌ FAILED: $_" -ForegroundColor Red; $fail++ }

Write-Host "`n====== RESULTS ======" -ForegroundColor Yellow
Write-Host "Passed: $pass" -ForegroundColor Green
Write-Host "Failed: $fail" -ForegroundColor $(if ($fail -eq 0) { 'Green' } else { 'Red' })
Write-Host "=====================" -ForegroundColor Yellow
