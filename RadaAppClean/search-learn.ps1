# Navigate to your RadaAppClean directory first
# cd path\to\RadaAppClean

# Search for files related to learn/admin modules
Write-Host "`n=== Searching for Learn Admin Files ===" -ForegroundColor Cyan

# Find all files with "learn" in the name
Write-Host "`nFiles with 'learn' in name:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*learn*" | Select-Object FullName

# Find all files with "module" in the name
Write-Host "`nFiles with 'module' in name:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*module*" | Select-Object FullName

# Find all files with "lesson" in the name
Write-Host "`nFiles with 'lesson' in name:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*lesson*" | Select-Object FullName

# Find all files with "quiz" in the name
Write-Host "`nFiles with 'quiz' in name:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*quiz*" | Select-Object FullName

# Find all files with "learning" and "path" in the name
Write-Host "`nFiles with 'path' in name:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*path*" | Select-Object FullName

# Search file contents for specific terms
Write-Host "`n=== Searching File Contents ===" -ForegroundColor Cyan

# Search for "learn" in file contents
Write-Host "`nFiles containing 'learn tab' or 'learn admin':" -ForegroundColor Yellow
Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx,*.vue,*.php,*.py | Select-String -Pattern "learn.*(tab|admin)" -List | Select-Object Path

# Search for modules/lessons/quizzes in code
Write-Host "`nFiles containing 'module' or 'lesson' or 'quiz':" -ForegroundColor Yellow
Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx,*.vue,*.php,*.py | Select-String -Pattern "(module|lesson|quiz|learning.?path)" -List | Select-Object Path

# Search for admin routes/controllers
Write-Host "`nAdmin-related files:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*admin*" | Where-Object { $_.Name -match "(learn|module|lesson|quiz)" } | Select-Object FullName

# Search in specific common directories
Write-Host "`n=== Checking Common Directories ===" -ForegroundColor Cyan

$commonPaths = @(
    "src/components/admin",
    "src/pages/admin", 
    "app/Http/Controllers/Admin",
    "resources/views/admin",
    "components/admin",
    "pages/admin"
)

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "`nFiles in ${path}:" -ForegroundColor Yellow
        Get-ChildItem -Path $path -Recurse | Select-Object FullName
    }
}