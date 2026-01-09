#!/usr/bin/env pwsh

# OCHO API Complete Test Suite
$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    Write-Host "`n🔵 $Name" -ForegroundColor Cyan
    Write-Host "   $Method $Uri" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            TimeoutSec = 10
            ErrorAction = 'Stop'
        }
        
        if ($Headers.Count -gt 0) { $params['Headers'] = $Headers }
        if ($Body) { $params['Body'] = ($Body | ConvertTo-Json); $params['ContentType'] = 'application/json' }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 1 | Select-Object -First 2)"
        $script:testsPassed++
        return $response
    }
    catch {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host "
╔════════════════════════════════════════╗
║   OCHO API TEST SUITE                  ║
║   Testing at: $baseUrl                ║
╚════════════════════════════════════════╝" -ForegroundColor Yellow

# Test 1: Health check
Test-Endpoint -Name "Health Check" -Method GET -Uri "$baseUrl/" | Out-Null

# Test 2: Register user
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test_$timestamp@ocho.local"
$registerBody = @{
    nom = "Test User"
    email = $testEmail
    mot_de_passe = "Password123!"
    role_id = 3
}

Write-Host "`nℹ️  Creating test account: $testEmail" -ForegroundColor Cyan
$registerResp = Test-Endpoint -Name "User Registration" -Method POST -Uri "$baseUrl/api/auth/register" -Body $registerBody

# Test 3: Login
$loginBody = @{
    email = $testEmail
    password = "Password123!"
}

$loginResp = Test-Endpoint -Name "User Login" -Method POST -Uri "$baseUrl/api/auth/login" -Body $loginBody

$token = $null
if ($loginResp) {
    $token = $loginResp.token
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Green
}

if (-not $token) {
    Write-Host "`n❌ Cannot continue without token!" -ForegroundColor Red
    exit 1
}

# Headers with token
$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 4-6: Products
Test-Endpoint -Name "Get Products" -Method GET -Uri "$baseUrl/api/products" -Headers $authHeaders | Out-Null
Test-Endpoint -Name "Get Categories" -Method GET -Uri "$baseUrl/api/products/categories/all" -Headers $authHeaders | Out-Null

# Test 7-8: Clients
Test-Endpoint -Name "Get Clients" -Method GET -Uri "$baseUrl/api/clients" -Headers $authHeaders | Out-Null

# Test 9-10: Commandes
Test-Endpoint -Name "Get Commandes" -Method GET -Uri "$baseUrl/api/commandes" -Headers $authHeaders | Out-Null

# Test 11-12: Dashboard
Test-Endpoint -Name "Get Dashboard Stats" -Method GET -Uri "$baseUrl/api/dashboard/stats" -Headers $authHeaders | Out-Null
Test-Endpoint -Name "Get Alerts" -Method GET -Uri "$baseUrl/api/dashboard/alertes" -Headers $authHeaders | Out-Null

# Test 13: Verify Token
Test-Endpoint -Name "Verify Token" -Method GET -Uri "$baseUrl/api/auth/verify" -Headers $authHeaders | Out-Null

# Summary
Write-Host "`n
╔════════════════════════════════════════╗
║   TEST RESULTS                         ║
╠════════════════════════════════════════╣
║ Passed: $testsPassed                   ║
║ Failed: $testsFailed                   ║
╚════════════════════════════════════════╝" -ForegroundColor $(if ($testsFailed -eq 0) { 'Green' } else { 'Yellow' })
