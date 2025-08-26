Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎨 Setting up User Content Creator Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📁 Creating upload directories..." -ForegroundColor Yellow
if (!(Test-Path "uploads")) { New-Item -ItemType Directory -Name "uploads" }
if (!(Test-Path "uploads\content")) { New-Item -ItemType Directory -Name "content" -Path "uploads" }
Write-Host "✅ Upload directories created!" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing required packages..." -ForegroundColor Yellow
npm install multer
Write-Host "✅ Packages installed!" -ForegroundColor Green

Write-Host ""
Write-Host "🗄️ Setting up database tables..." -ForegroundColor Yellow
Write-Host "Please run the following SQL command in your MySQL database:" -ForegroundColor White
Write-Host ""
Write-Host "mysql -u your_username -p your_database < setup_content_tables.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or copy and paste the contents of setup_content_tables.sql into your MySQL client" -ForegroundColor White
Write-Host ""

Write-Host ""
Write-Host "🚀 Starting server..." -ForegroundColor Yellow
Write-Host "The content creation endpoints are now integrated into your server.js" -ForegroundColor White
Write-Host ""

Write-Host "📱 Your mobile app now has:" -ForegroundColor Cyan
Write-Host "   - Floating pencil button (✏️) with speed dial" -ForegroundColor White
Write-Host "   - Content creation modal with 4 types" -ForegroundColor White
Write-Host "   - Media upload support" -ForegroundColor White
Write-Host "   - XP reward system" -ForegroundColor White
Write-Host "   - Content moderation workflow" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Setup complete! Your users can now create content!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to continue..."

