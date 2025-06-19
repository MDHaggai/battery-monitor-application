# Battery Monitor App - Setup Script

Write-Host "🔋 Setting up Battery Monitor Application..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Check if Expo CLI is installed globally
try {
    $expoVersion = expo --version
    Write-Host "✅ Expo CLI found: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Expo CLI not found globally. Installing..." -ForegroundColor Yellow
    npm install -g @expo/cli
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Expo CLI installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Expo CLI." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload the ESP32 code to your MH-ET LIVE ESP32 MiniKIT V2.0"
Write-Host "2. Connect ESP32 to WiFi network 'ACCESS DENIED 2'"
Write-Host "3. Note the ESP32 IP address from Serial Monitor"
Write-Host "4. Update the IP address in the app settings"
Write-Host "5. Run: npm start"
Write-Host "6. Scan QR code with Expo Go app on your Android device"
Write-Host ""
Write-Host "📱 Make sure to install Expo Go from Google Play Store!" -ForegroundColor Yellow
