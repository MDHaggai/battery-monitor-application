# Battery Monitor App - Icon Generation Script
# This script helps convert SVG icons to required PNG formats for React Native/Expo

Write-Host "=== Battery Monitor App - Icon Converter ===" -ForegroundColor Green
Write-Host ""

# Check if ImageMagick is installed
$imageMagickInstalled = $false
try {
    $magickOutput = magick -version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $imageMagickInstalled = $true
        Write-Host "✅ ImageMagick detected" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ImageMagick not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "📱 Required icon sizes:" -ForegroundColor Yellow
Write-Host "   • icon.png: 1024x1024 (App Store icon)"
Write-Host "   • adaptive-icon.png: 1024x1024 (Android adaptive icon foreground)"
Write-Host "   • splash.png: 1284x2778 (iPhone 14 Pro Max splash)"
Write-Host "   • favicon.png: 48x48 (Web favicon)"
Write-Host ""

if ($imageMagickInstalled) {
    Write-Host "🔧 Converting icons with ImageMagick..." -ForegroundColor Blue
    
    # Convert app icon
    if (Test-Path "assets/app-icon.svg") {
        magick "assets/app-icon.svg" -resize 1024x1024 "assets/icon.png"
        Write-Host "✅ Created icon.png (1024x1024)"
    } else {
        Write-Host "❌ assets/app-icon.svg not found"
    }
    
    # Convert adaptive icon
    if (Test-Path "assets/adaptive-icon-foreground.svg") {
        magick "assets/adaptive-icon-foreground.svg" -resize 1024x1024 "assets/adaptive-icon.png"
        Write-Host "✅ Created adaptive-icon.png (1024x1024)"
    } else {
        Write-Host "❌ assets/adaptive-icon-foreground.svg not found"
    }
    
    # Convert splash screen
    if (Test-Path "assets/splash-screen.svg") {
        magick "assets/splash-screen.svg" -resize 1284x2778 "assets/splash.png"
        Write-Host "✅ Created splash.png (1284x2778)"
    } else {
        Write-Host "❌ assets/splash-screen.svg not found"
    }
    
    # Convert favicon
    if (Test-Path "assets/favicon.svg") {
        magick "assets/favicon.svg" -resize 48x48 "assets/favicon.png"
        Write-Host "✅ Created favicon.png (48x48)"
    } else {
        Write-Host "❌ assets/favicon.svg not found"
    }
    
    Write-Host ""
    Write-Host "🎉 All icons generated successfully!" -ForegroundColor Green
} else {
    Write-Host "📋 Manual conversion required:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Install ImageMagick:" -ForegroundColor Cyan
    Write-Host "   1. Download from: https://imagemagick.org/script/download.php#windows"
    Write-Host "   2. Install and add to PATH"
    Write-Host "   3. Run this script again"
    Write-Host ""
    Write-Host "Option 2 - Online converter (recommended):" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://convertio.co/svg-png/"
    Write-Host "   2. Upload each SVG file from assets/ folder"
    Write-Host "   3. Set quality to 100% and convert to PNG"
    Write-Host "   4. Resize to required dimensions:"
    Write-Host "      • app-icon.svg → icon.png (1024x1024)"
    Write-Host "      • adaptive-icon-foreground.svg → adaptive-icon.png (1024x1024)"
    Write-Host "      • splash-screen.svg → splash.png (1284x2778)"
    Write-Host "      • favicon.svg → favicon.png (48x48)"
    Write-Host ""
    Write-Host "Option 3 - Figma/Canva:" -ForegroundColor Cyan
    Write-Host "   1. Import SVG files to Figma or Canva"
    Write-Host "   2. Resize to required dimensions"
    Write-Host "   3. Export as PNG"
}

Write-Host ""
Write-Host "📁 Icon files should be placed in:" -ForegroundColor Magenta
Write-Host "   assets/icon.png"
Write-Host "   assets/adaptive-icon.png"
Write-Host "   assets/splash.png"
Write-Host "   assets/favicon.png"
Write-Host ""
Write-Host "🔧 After generating icons, run:" -ForegroundColor Blue
Write-Host "   eas build --platform android --profile development"
Write-Host ""

# Check if SVG files exist
$svgFiles = @("app-icon.svg", "adaptive-icon-foreground.svg", "splash-screen.svg", "favicon.svg")
Write-Host "📋 SVG Source Files Status:" -ForegroundColor Yellow
foreach ($file in $svgFiles) {
    $path = "assets/$file"
    if (Test-Path $path) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (missing)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
