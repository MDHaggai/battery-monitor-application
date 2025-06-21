# Simple Development Icon Creator
Write-Host "=== Battery Monitor - Development Icons ===" -ForegroundColor Green
Write-Host ""

# Check current PNG files
$icons = @(
    @{svg="app-icon.svg"; png="icon.png"; size="1024x1024"},
    @{svg="adaptive-icon-foreground.svg"; png="adaptive-icon.png"; size="1024x1024"},
    @{svg="splash-screen.svg"; png="splash.png"; size="1284x2778"},
    @{svg="favicon.svg"; png="favicon.png"; size="48x48"}
)

foreach ($icon in $icons) {
    $svgPath = "assets\$($icon.svg)"
    $pngPath = "assets\$($icon.png)"
    
    Write-Host "Processing $($icon.png)..." -ForegroundColor Yellow
    
    if (Test-Path $pngPath) {
        Write-Host "   ✅ $($icon.png) already exists" -ForegroundColor Green
    } elseif (Test-Path $svgPath) {
        Write-Host "   📋 Found $($icon.svg) - needs conversion to PNG ($($icon.size))" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Missing $($icon.svg)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 To convert SVG to PNG:" -ForegroundColor Blue
Write-Host "1. Go to: https://cloudconvert.com/svg-to-png" -ForegroundColor White
Write-Host "2. Upload and convert with these sizes:" -ForegroundColor White
Write-Host "   • app-icon.svg → icon.png (1024x1024)" -ForegroundColor White
Write-Host "   • adaptive-icon-foreground.svg → adaptive-icon.png (1024x1024)" -ForegroundColor White  
Write-Host "   • splash-screen.svg → splash.png (1284x2778)" -ForegroundColor White
Write-Host "   • favicon.svg → favicon.png (48x48)" -ForegroundColor White

Write-Host ""
Write-Host "📁 Place converted files in assets/ folder" -ForegroundColor Magenta
Write-Host "🚀 Then run: eas build --platform android --profile development" -ForegroundColor Green
