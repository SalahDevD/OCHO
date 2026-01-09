@echo off
cd /d "C:\Users\salah\OneDrive\Desktop\OCHO\backend"
echo.
echo ===== OCHO API Server =====
echo Directory: %cd%
echo.
echo Starting on port 5000...
node raw-server.js
pause
