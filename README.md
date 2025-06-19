# Battery Monitor Application

A beautiful React Native Expo Go application for monitoring and controlling car battery systems using ESP32.

## Features

- **Real-time Battery Monitoring**: Monitor voltage, current (dual sensors), and temperature
- **Beautiful Dark UI**: Modern, sleek interface with animations and gradients
- **LED Control System**: Control 8 LEDs (2 auto-on, 6 manual control)
- **WiFi Communication**: Connects to ESP32 via WiFi
- **Historical Data**: Charts and analytics for battery performance
- **Alert System**: Customizable thresholds for battery parameters
- **Settings Management**: Configure ESP32 IP, WiFi, and app preferences

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure ESP32**:
   - Update the ESP32 IP address in the app (default: 192.168.1.100)
   - Ensure ESP32 is connected to WiFi network "ACCESS DENIED 2"

3. **Start the App**:
   ```bash
   npm start
   ```

4. **Run on Device**:
   - Install Expo Go on your Android device
   - Scan the QR code displayed in terminal

## ESP32 Setup

### Hardware Connections
- **Voltage Sensor**: GPIO36 (analog input)
- **Current Sensor 1**: GPIO15 (analog input)  
- **Current Sensor 2**: GPIO3 (analog input)
- **Auto LEDs**: GPIO16, GPIO5 (turn on at startup)
- **Manual LEDs**: GPIO4, GPIO0, GPIO2, GPIO14, GPIO12, GPIO13

### WiFi Configuration
- **SSID**: ACCESS DENIED 2
- **Password**: 123456
- **Server Port**: 80

### API Endpoints
- `GET /` - Returns sensor data as JSON
- `GET /led?pin=X&state=Y` - Controls LED (pin 0-5, state 0/1)

## App Structure

```
src/
├── screens/
│   ├── DashboardScreen.js    # Main battery status display
│   ├── ControlScreen.js      # LED control interface
│   ├── MonitoringScreen.js   # Charts and historical data
│   └── SettingsScreen.js     # App configuration
└── components/
    ├── BatteryWidget.js      # Animated battery display
    ├── SensorCard.js         # Individual sensor displays
    └── ConnectionStatus.js   # WiFi connection indicator
```

## Features by Screen

### Dashboard
- Large battery percentage display with animations
- Real-time voltage, current, and temperature
- Connection status indicator
- Emergency shutdown button

### Control
- Manual LED controls with beautiful switches
- Auto-LED status display
- Quick action buttons (All ON/OFF)
- Visual feedback for LED states

### Monitoring
- Interactive charts for all sensor data
- Time range selection (1H, 6H, 24H)
- Statistical analysis (min, max, average)
- Alert history

### Settings
- ESP32 IP configuration
- WiFi settings management
- Alert threshold configuration
- App preferences (refresh rate, notifications)

## Customization

### Colors
The app uses a modern dark theme with accent colors:
- Primary Blue: `#00D4FF`
- Success Green: `#00FF88`
- Warning Yellow: `#FFD700`
- Error Red: `#FF4444`
- Background: `#0a0a0a`

### LED Configuration
Modify LED pins and behavior in `ControlScreen.js`:
```javascript
const ledControls = [
  { id: 'headlamp', pin: 0, icon: 'bulb', color: '#FFD700' },
  // Add more LED configurations
];
```

## Troubleshooting

1. **Connection Issues**:
   - Verify ESP32 IP address
   - Check WiFi network connectivity
   - Ensure ESP32 web server is running

2. **LED Control Not Working**:
   - Check ESP32 GPIO connections
   - Verify relay wiring (active LOW)
   - Test individual endpoints in browser

3. **App Not Loading**:
   - Clear Expo cache: `expo start -c`
   - Reinstall dependencies: `npm install`
   - Check React Native compatibility

## Development

### Adding New Sensors
1. Update ESP32 code to read new sensor
2. Add sensor data to JSON response
3. Create new `SensorCard` component
4. Add to dashboard grid

### Custom Animations
The app uses `react-native-animatable`. Add new animations:
```javascript
<Animatable.View animation="fadeIn" duration={1000}>
  {/* Your content */}
</Animatable.View>
```

## License

MIT License - Feel free to modify and distribute.