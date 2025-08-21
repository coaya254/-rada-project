Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Rada.ke Mobile App - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor White
Write-Host "- Press 'i' for iOS simulator" -ForegroundColor Gray
Write-Host "- Press 'a' for Android emulator" -ForegroundColor Gray
Write-Host "- Press 'w' for web browser" -ForegroundColor Gray
Write-Host "- Scan QR code with Expo Go app on your phone" -ForegroundColor Gray
Write-Host ""

npm start

Read-Host "Press Enter to exit"
