# Development Build Setup Guide

This app requires a **development build** (not Expo Go) to use WiFi scanning and connection features with your ESP32 battery monitor.

## Prerequisites

1. **ESP32 Setup**: Make sure your ESP32 is configured as a WiFi Access Point with the name:
   - `BatteryMonitorAP` (recommended)
   - Or any name containing "battery", "esp32", or "monitor"

2. **Physical Device**: You need an Android device (iPhone WiFi control is more limited)

## Building for Development

### Option 1: EAS Build (Recommended)
```bash
# Install EAS CLI if you haven't already
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android development
eas build --platform android --profile development
```

### Option 2: Local Build
```bash
# Generate native code
npx expo prebuild --platform android

# Build with Android Studio or
npx expo run:android
```

## Required Permissions

The app requests these permissions (already configured in app.json):
- `ACCESS_WIFI_STATE` - Read WiFi info
- `CHANGE_WIFI_STATE` - Connect to WiFi networks
- `ACCESS_FINE_LOCATION` - Required for WiFi scanning on Android
- `ACCESS_COARSE_LOCATION` - Required for WiFi scanning on Android

## Testing WiFi Features

1. **WiFi Scanning**: 
   - Tap "Register New Car" 
   - Tap "Scan for Networks"
   - You should see real WiFi networks (not dummy data)

2. **ESP32 Connection**:
   - Look for networks with "ESP32", "Battery", or "Monitor" in the name
   - Connect with the password you set on your ESP32
   - The app will register the car and store the session

3. **Dashboard Connection**:
   - After connecting, the dashboard should show:
     - Car name in the header
     - "Connected to [WiFi SSID]" subtitle
     - Green "Connected" status indicator
     - Real data from ESP32 (if running the server code)

4. **Controls**:
   - All LED controls will send commands to the connected ESP32 IP
   - Monitor the ESP32 serial output to see incoming requests

## Troubleshooting

### WiFi Scan Issues
- Ensure location services are enabled
- Grant location permissions when prompted
- Make sure you're using a development build, not Expo Go

### Connection Issues
- Check ESP32 is broadcasting the AP
- Verify the WiFi password is correct
- Ensure ESP32 web server is running on 192.168.4.1

### No Data from ESP32
- Check ESP32 serial monitor for connection attempts
- Verify the battery monitoring code is uploaded to ESP32
- Test ESP32 endpoints directly: http://192.168.4.1/

## Console Debugging

Check the development console for these messages:
- "Stored new session: [session data]" - When connecting to new ESP32
- "Dashboard loaded session: [session data]" - When opening dashboard
- "Control screen loaded session: [session data]" - When opening controls

## ESP32 Endpoints Expected

Your ESP32 should provide these endpoints:
- `GET /` - Return battery data JSON
- `GET /led?pin=X&state=Y` - Control LEDs (pin 0-5, state 0/1)

Example battery data response:
```json
{
  "voltage": 12.6,
  "current1": 2.3,
  "current2": 1.8,
  "percentage": 85,
  "temperature": 24
}
```
