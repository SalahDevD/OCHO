#!/bin/bash
# Quick troubleshooting checklist

echo "🔍 OCHO - Vérification rapide d'authentification et CORS"
echo "=========================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Vérifier que le serveur est démarré${NC}"
echo "   Command: Get-Process node | Select-Object Id, Name, CPU, Memory"
echo ""

echo -e "${YELLOW}2. Vérifier les configurations${NC}"
echo "   ✓ backend/.env → JWT_SECRET=ocho_secret_jwt_2026_change_me_in_production"
echo "   ✓ backend/server.js → corsOptions configuré"
echo ""

echo -e "${YELLOW}3. Accès au frontend${NC}"
echo "   ✅ http://localhost:5000/            → Index (login)"
echo "   ✅ http://localhost:5000/pages/      → Toutes les pages"
echo "   ✅ http://localhost:5000/debug-token.html → Debug tool"
echo ""

echo -e "${YELLOW}4. Dans le navigateur (F12 → Console)${NC}"
echo "   // Vérifier l'origine"
echo "   console.log(window.location.origin)"
echo ""
echo "   // Vérifier le token"
echo "   localStorage.getItem('token')"
echo "   localStorage.getItem('user')"
echo ""

echo -e "${YELLOW}5. Erreurs courantes${NC}"
echo "   ❌ 401 Unauthorized → Token invalide/manquant"
echo "   ❌ CORS Origin null → Accès via file:// au lieu de http://"
echo "   ❌ Failed to fetch → Serveur pas démarré ou CORS bloqué"
echo ""

echo -e "${GREEN}6. Solutions rapides${NC}"
echo "   • localStorage.clear()     → Effacer le cache"
echo "   • Relancer le serveur      → Appliquer nouvelles configs"
echo "   • Recharger la page        → F5 ou Ctrl+F5"
echo "   • Vérifier DevTools        → Network tab pour voir les requêtes"
echo ""

echo -e "${YELLOW}7. Test de login${NC}"
echo "   Email:    admin@ocho.com"
echo "   Password: admin123"
echo ""
