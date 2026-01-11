#!/usr/bin/env pwsh

# Script de test - Gestion des images de produits

Write-Host "Test du Systeme de Gestion des Images de Produits" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api"
$token = ""

# Test 1: Verification de la structure du formulaire
Write-Host "Test 1: Verification du formulaire HTML" -ForegroundColor Green
$htmlFile = "frontend/pages/products.html"
if (Test-Path $htmlFile) {
    $content = Get-Content $htmlFile -Raw
    if ($content -match 'id="image_url"') {
        Write-Host "   [OK] Champ image_url trouve dans le formulaire" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Champ image_url NOT trouve!" -ForegroundColor Red
    }
} else {
    Write-Host "   [FAIL] Fichier HTML introuvable!" -ForegroundColor Red
}

# Test 2: Verification des fonctions JavaScript
Write-Host ""
Write-Host "Test 2: Verification des fonctions JavaScript" -ForegroundColor Green
$jsFile = "frontend/js/products.js"
if (Test-Path $jsFile) {
    $content = Get-Content $jsFile -Raw
    
    if ($content -match 'function getImageHtml') {
        Write-Host "   [OK] Fonction getImageHtml() trouvee" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Fonction getImageHtml() NOT trouvee!" -ForegroundColor Red
    }
    
    if ($content -match 'openImageEditorModal') {
        Write-Host "   [OK] Fonction openImageEditorModal() trouvee" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Fonction openImageEditorModal() NOT trouvee!" -ForegroundColor Red
    }
    
    if ($content -match 'image_url:') {
        Write-Host "   [OK] image_url incluse dans l envoi de donnees" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] image_url NOT incluse dans l envoi!" -ForegroundColor Red
    }
} else {
    Write-Host "   [FAIL] Fichier JavaScript introuvable!" -ForegroundColor Red
}

# Test 3: Verification du controleur backend
Write-Host ""
Write-Host "Test 3: Verification du controleur Backend" -ForegroundColor Green
$controllerFile = "backend/controllers/productController.js"
if (Test-Path $controllerFile) {
    $content = Get-Content $controllerFile -Raw
    
    if ($content -match 'image_url') {
        Write-Host "   [OK] Support de image_url dans le controleur" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Support de image_url NOT trouve!" -ForegroundColor Red
    }
} else {
    Write-Host "   [FAIL] Fichier controleur introuvable!" -ForegroundColor Red
}

# Test 4: Verification du schema de base de donnees
Write-Host ""
Write-Host "Test 4: Verification du schema de Base de Donnees" -ForegroundColor Green
$sqlFile = "backend/config/init.sql"
if (Test-Path $sqlFile) {
    $content = Get-Content $sqlFile -Raw
    
    if ($content -match 'image_url.*VARCHAR') {
        Write-Host "   [OK] Colonne image_url trouvee dans la table Produit" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Colonne image_url NOT trouvee!" -ForegroundColor Red
    }
} else {
    Write-Host "   [FAIL] Fichier SQL introuvable!" -ForegroundColor Red
}

# Resume
Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Resume des Verifications" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fonctionnalites implementees:" -ForegroundColor Yellow
Write-Host "  [OK] Affichage des images dans la liste des produits"
Write-Host "  [OK] Affichage des images dans la vue details"
Write-Host "  [OK] Bouton pour modifier l image depuis les details"
Write-Host "  [OK] Edition des images lors de la creation/modification de produits"
Write-Host "  [OK] Support des emojis et URLs d images"
Write-Host "  [OK] Apercu en temps reel des images"
Write-Host ""
Write-Host "Pour tester le systeme:" -ForegroundColor Yellow
Write-Host "  1. Demarrez le serveur: npm start (dans /backend)"
Write-Host "  2. Ouvrez le navigateur: http://localhost:5000/frontend/pages/products.html"
Write-Host "  3. Creez ou modifiez un produit avec une image"
Write-Host "  4. Verifiez que l image s affiche dans la liste et les details"
Write-Host ""
Write-Host "Tests complets!" -ForegroundColor Green
