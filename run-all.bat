@echo off
:: %~dp0 అనేది ఈ బ్యాచ్ ఫైల్ ఎక్కడ ఉందో ఆ ఫోల్డర్ పాత్‌ని తీసుకుంటుంది
cd /d "%~dp0"

echo Starting all services...
start cmd /k "cd admin-panel && npm run dev"
start cmd /k "cd customer-app && npm run dev"
start cmd /k "cd shop-panel && npm run dev"
start cmd /k "cd delivery-panel && npm run dev"