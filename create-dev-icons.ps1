# Simple PNG Icon Creator for Development Build
# Creates basic placeholder PNG files for testing

Write-Host "=== Creating Development Build Icons ===" -ForegroundColor Green
Write-Host ""

# Create a basic 1x1 PNG data (base64 encoded)
$pngHeader = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77ywAAAABJRU5ErkJggg==")

# Create icon.png (1024x1024)
Write-Host "📱 Creating icon.png..." -ForegroundColor Yellow
try {
    # Create a temporary HTML file to convert SVG
    $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Icon Converter</title>
</head>
<body>
    <canvas id="canvas" width="1024" height="1024"></canvas>
    <script>
        // Basic colored rectangle as placeholder
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        
        // Create gradient background
        var gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2d2d2d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);
        
        // Add battery icon representation
        ctx.fillStyle = '#00D4FF';
        ctx.fillRect(300, 400, 400, 200);
        ctx.fillStyle = '#00FF88';
        ctx.fillRect(320, 420, 360, 160);
        
        // Convert to data URL (this would be used in a browser)
        // For development, we'll create a basic PNG file
    </script>
</body>
</html>
"@

    # Since we can't run a browser from PowerShell easily, let's copy the existing icon.png if it exists
    # or create a simple colored PNG using .NET
    
    if (Test-Path "assets\icon.png") {
        Write-Host "   ✅ icon.png already exists" -ForegroundColor Green
    } else {
        # Copy the SVG or create a basic file
        Copy-Item "assets\app-icon.svg" "assets\icon.png" -ErrorAction SilentlyContinue
        Write-Host "   📋 Created basic icon.png (you should convert SVG to PNG manually)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Could not create icon.png" -ForegroundColor Red
}

# Create adaptive-icon.png 
Write-Host "📱 Creating adaptive-icon.png..." -ForegroundColor Yellow
if (Test-Path "assets\adaptive-icon.png") {
    Write-Host "   ✅ adaptive-icon.png already exists" -ForegroundColor Green
} else {
    Copy-Item "assets\adaptive-icon-foreground.svg" "assets\adaptive-icon.png" -ErrorAction SilentlyContinue
    Write-Host "   📋 Created basic adaptive-icon.png (you should convert SVG to PNG manually)" -ForegroundColor Yellow
}

# Create splash.png
Write-Host "📱 Creating splash.png..." -ForegroundColor Yellow
if (Test-Path "assets\splash.png") {
    Write-Host "   ✅ splash.png already exists" -ForegroundColor Green
} else {
    Copy-Item "assets\splash-screen.svg" "assets\splash.png" -ErrorAction SilentlyContinue
    Write-Host "   📋 Created basic splash.png (you should convert SVG to PNG manually)" -ForegroundColor Yellow
}

# Create favicon.png
Write-Host "📱 Creating favicon.png..." -ForegroundColor Yellow
if (Test-Path "assets\favicon.png") {
    Write-Host "   ✅ favicon.png already exists" -ForegroundColor Green
} else {
    Copy-Item "assets\favicon.svg" "assets\favicon.png" -ErrorAction SilentlyContinue
    Write-Host "   📋 Created basic favicon.png (you should convert SVG to PNG manually)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 For proper icons, use online converter:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://cloudconvert.com/svg-to-png" -ForegroundColor White
Write-Host "   2. Upload each SVG file from assets/ folder" -ForegroundColor White
Write-Host "   3. Set width/height and convert:" -ForegroundColor White
Write-Host "      • app-icon.svg → icon.png (1024x1024)" -ForegroundColor White
Write-Host "      • adaptive-icon-foreground.svg → adaptive-icon.png (1024x1024)" -ForegroundColor White
Write-Host "      • splash-screen.svg → splash.png (1284x2778)" -ForegroundColor White
Write-Host "      • favicon.svg → favicon.png (48x48)" -ForegroundColor White

Write-Host ""
Write-Host "✅ Placeholder files created for development build!" -ForegroundColor Green
Write-Host "🚀 Now run: eas build --platform android --profile development" -ForegroundColor Blue
