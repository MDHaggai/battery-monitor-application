# ESP32 Hardware Setup Guide

## Components Required

1. **MH-ET LIVE ESP32 MiniKIT V2.0**
2. **Voltage Sensor Module** (0-25V or voltage divider circuit)
3. **Current Sensor Modules** (2x ACS712 5A/20A/30A)
4. **8-Channel Relay Module** (or individual relays)
5. **LEDs** (8 pieces)
6. **LM7805 Voltage Regulator**
7. **Resistors and Capacitors** (for voltage divider and filtering)
8. **Breadboard/PCB and Jumper Wires**

## Pin Connections

### Power Supply
```
12V Battery → LM7805 Input
LM7805 Output → ESP32 VIN (5V)
GND → Common Ground
```

### Sensor Connections
```
Voltage Sensor → GPIO36 (ADC1_CH0)
Current Sensor 1 → GPIO15 (ADC2_CH3)
Current Sensor 2 → GPIO3 (ADC1_CH6) - Boot sensitive
```

### LED/Relay Connections
```
Auto LEDs (Always ON):
- LED 1 Relay → GPIO16
- LED 2 Relay → GPIO5

Manual Control LEDs:
- Headlamp Relay → GPIO4
- Car Light Relay → GPIO0 (Boot sensitive)
- Trafficator Relay → GPIO2 (Boot sensitive)
- Rear Light Relay → GPIO14
- Extra Light 1 Relay → GPIO12
- Extra Light 2 Relay → GPIO13
```

## Voltage Divider Circuit

For measuring 12V battery voltage with 3.3V ESP32 ADC:

```
12V Battery ----[R1: 10kΩ]----+----[R2: 2.2kΩ]---- GND
                               |
                           GPIO36 (Max 3.3V)
```

**Calculation**: 
- Max input: 15V
- Divider ratio: 2.2kΩ / (10kΩ + 2.2kΩ) = 0.18
- 15V × 0.18 = 2.7V (safe for ESP32)

## Current Sensor Setup

### ACS712 Current Sensors

**ACS712-05B (±5A):**
- Sensitivity: 185 mV/A
- Zero current: 2.5V
- Supply: 5V

**ACS712-20A (±20A):**
- Sensitivity: 100 mV/A
- Zero current: 2.5V
- Supply: 5V

**ACS712-30A (±30A):**
- Sensitivity: 66 mV/A
- Zero current: 2.5V
- Supply: 5V

### Connections
```
ACS712 VCC → 5V
ACS712 GND → GND
ACS712 OUT → ESP32 GPIO (ADC pin)
Battery + → ACS712 Terminal 1
Load + → ACS712 Terminal 2
```

## Relay Module Setup

### 8-Channel Relay Module
```
VCC → 5V (or 3.3V depending on module)
GND → GND
IN1 → GPIO16 (Auto LED 1)
IN2 → GPIO5 (Auto LED 2)
IN3 → GPIO4 (Headlamp)
IN4 → GPIO0 (Car Light)
IN5 → GPIO2 (Trafficator)
IN6 → GPIO14 (Rear Light)
IN7 → GPIO12 (Extra Light 1)
IN8 → GPIO13 (Extra Light 2)
```

### LED Connections
```
12V+ → Relay Common (COM)
Relay NO → LED + → LED - → GND
```

## Boot Considerations

**Boot-sensitive pins** need proper handling:
- **GPIO0**: Must be HIGH during boot (add 10kΩ pull-up)
- **GPIO2**: Must be LOW during boot (add 10kΩ pull-down)
- **GPIO3**: RX pin, avoid during boot

## Circuit Diagram

```
ESP32 MiniKIT V2.0
┌─────────────────┐
│                 │
│  GPIO36 ────────┼──── Voltage Divider ──── 12V Battery
│  GPIO15 ────────┼──── Current Sensor 1
│  GPIO3  ────────┼──── Current Sensor 2
│                 │
│  GPIO16 ────────┼──── Relay 1 (Auto LED 1)
│  GPIO5  ────────┼──── Relay 2 (Auto LED 2)
│  GPIO4  ────────┼──── Relay 3 (Headlamp)
│  GPIO0  ────────┼──── Relay 4 (Car Light)
│  GPIO2  ────────┼──── Relay 5 (Trafficator)
│  GPIO14 ────────┼──── Relay 6 (Rear Light)
│  GPIO12 ────────┼──── Relay 7 (Extra Light 1)
│  GPIO13 ────────┼──── Relay 8 (Extra Light 2)
│                 │
│  VIN ───────────┼──── 5V (from LM7805)
│  GND ───────────┼──── Common Ground
└─────────────────┘
```

## Safety Considerations

1. **Fuse Protection**: Add fuses on all LED circuits
2. **Voltage Regulation**: Use proper voltage regulators
3. **Isolation**: Consider optocouplers for relay control
4. **Heat Dissipation**: Ensure adequate cooling for regulators
5. **Wire Gauge**: Use appropriate wire gauge for current capacity
6. **Connector Quality**: Use good quality connectors for automotive use

## Testing Procedure

1. **Power Test**: Verify 5V and 3.3V rails
2. **Sensor Test**: Check voltage and current readings
3. **Relay Test**: Manually test each relay
4. **Boot Test**: Ensure ESP32 boots reliably
5. **WiFi Test**: Verify network connectivity
6. **App Test**: Test all functions from mobile app

## Troubleshooting

### ESP32 Won't Boot
- Check GPIO0, GPIO2 pull resistors
- Verify power supply voltage and current
- Disconnect peripherals and test bare ESP32

### Incorrect Sensor Readings
- Check voltage divider ratios
- Verify current sensor orientation
- Calibrate using known values

### Relays Not Working
- Check relay module power supply
- Verify GPIO output levels
- Test relays manually with external power

### WiFi Connection Issues
- Check SSID and password
- Verify signal strength
- Check for interference

## Maintenance

1. **Regular Cleaning**: Keep connections clean and dry
2. **Voltage Monitoring**: Monitor supply voltages regularly
3. **Sensor Calibration**: Recalibrate sensors periodically
4. **Firmware Updates**: Keep ESP32 firmware updated
5. **Visual Inspection**: Check for loose connections or damage
