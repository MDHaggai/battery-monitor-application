#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// Access Point credentials
#define AP_SSID "BatteryMonitorAP"
#define AP_PASS "12345678"

// Auto-on LEDs (turn on at startup)
#define AUTO_LED_1 16
#define AUTO_LED_2 5

// Manual control LEDs (controlled via app)
int MANUAL_LED_PINS[] = {4, 0, 2, 14, 12, 13}; // 6 LEDs
#define NUM_MANUAL_LEDS 6

// Sensor pins
#define VOLTAGE_PIN 36
#define CURRENT1_PIN 15
#define CURRENT2_PIN 3

// Web server on port 80
WebServer server(80);

// Sensor data variables
float voltage = 0.0;
float current1 = 0.0;
float current2 = 0.0;
float percentage = 0.0;
float temperature = 24.0; // Mock temperature for now

// LED states
bool manualLedStates[NUM_MANUAL_LEDS] = {false};

void setup() {
  Serial.begin(115200);
  
  // Initialize auto-on LEDs
  pinMode(AUTO_LED_1, OUTPUT);
  pinMode(AUTO_LED_2, OUTPUT);
  digitalWrite(AUTO_LED_1, LOW);  // Turn on (relays are active LOW)
  digitalWrite(AUTO_LED_2, LOW);  // Turn on (relays are active LOW)
  
  // Initialize manual control LEDs
  for (int i = 0; i < NUM_MANUAL_LEDS; i++) {
    pinMode(MANUAL_LED_PINS[i], OUTPUT);
    digitalWrite(MANUAL_LED_PINS[i], HIGH); // Turn off (relays are active LOW)
    manualLedStates[i] = false;
  }
  
  // Set boot-sensitive pins with pull-up resistors
  pinMode(0, INPUT_PULLUP);
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  
  // Initialize sensor pins
  pinMode(VOLTAGE_PIN, INPUT);
  pinMode(CURRENT1_PIN, INPUT);
  pinMode(CURRENT2_PIN, INPUT);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Set up web server routes
  server.on("/", HTTP_GET, handleSensorData);
  server.on("/led", HTTP_GET, handleLEDControl);
  server.enableCORS(true); // Enable CORS for React Native
  
  // Start server
  server.begin();
  Serial.println("Web server started");
  Serial.println("Auto LEDs turned ON");
}

void loop() {
  server.handleClient();
  
  // Read sensor data
  readSensors();
  
  // Print status every 5 seconds
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 5000) {
    printStatus();
    lastPrint = millis();
  }
  
  delay(100);
}

void readSensors() {
  // Read voltage sensor (voltage divider: 0-15V mapped to 0-3.3V)
  int voltageRaw = analogRead(VOLTAGE_PIN);
  voltage = (voltageRaw / 4095.0) * 3.3 * (15.0 / 3.3); // Scale to actual voltage
  
  // Read current sensors (ACS712 or similar: 2.5V = 0A, sensitivity varies)
  int current1Raw = analogRead(CURRENT1_PIN);
  int current2Raw = analogRead(CURRENT2_PIN);
  
  // Convert to current (assuming ACS712-05B: 185mV/A, 2.5V offset)
  current1 = ((current1Raw / 4095.0 * 3.3) - 2.5) / 0.185;
  current2 = ((current2Raw / 4095.0 * 3.3) - 2.5) / 0.185;
  
  // Ensure non-negative current readings
  current1 = max(0.0f, current1);
  current2 = max(0.0f, current2);
  
  // Calculate battery percentage (12V system: 10.5V = 0%, 14.4V = 100%)
  percentage = constrain(mapFloat(voltage, 10.5, 14.4, 0, 100), 0, 100);
  
  // Mock temperature reading (you can add DS18B20 or similar)
  temperature = 24.0 + (random(-10, 30) / 10.0); // Simulate 22-27°C
}

void handleSensorData() {
  // Create JSON response
  DynamicJsonDocument doc(512);
  
  doc["voltage"] = round(voltage * 100) / 100.0;      // 2 decimal places
  doc["current1"] = round(current1 * 100) / 100.0;    // 2 decimal places
  doc["current2"] = round(current2 * 100) / 100.0;    // 2 decimal places
  doc["percentage"] = round(percentage * 10) / 10.0;   // 1 decimal place
  doc["temperature"] = round(temperature * 10) / 10.0; // 1 decimal place
  doc["timestamp"] = millis();
  
  // Add LED states
  JsonArray autoLeds = doc.createNestedArray("autoLeds");
  autoLeds.add(true);  // AUTO_LED_1 always on
  autoLeds.add(true);  // AUTO_LED_2 always on
  
  JsonArray manualLeds = doc.createNestedArray("manualLeds");
  for (int i = 0; i < NUM_MANUAL_LEDS; i++) {
    manualLeds.add(manualLedStates[i]);
  }
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
  
  Serial.println("Sensor data sent: " + response);
}

void handleLEDControl() {
  String response = "OK";
  int statusCode = 200;
  
  if (server.hasArg("pin") && server.hasArg("state")) {
    int pin = server.arg("pin").toInt();
    int state = server.arg("state").toInt();
    
    // Validate pin number
    if (pin >= 0 && pin < NUM_MANUAL_LEDS) {
      // Control the LED (relays are active LOW)
      digitalWrite(MANUAL_LED_PINS[pin], state ? LOW : HIGH);
      manualLedStates[pin] = (state == 1);
      
      response = "LED " + String(pin) + " (" + String(MANUAL_LED_PINS[pin]) + ") turned " + (state ? "ON" : "OFF");
      Serial.println(response);
    } else {
      response = "Invalid pin number. Valid range: 0-" + String(NUM_MANUAL_LEDS - 1);
      statusCode = 400;
    }
  } else {
    response = "Missing 'pin' or 'state' parameter. Usage: /led?pin=X&state=Y";
    statusCode = 400;
  }
  
  server.send(statusCode, "text/plain", response);
}

void printStatus() {
  Serial.println("=== BATTERY MONITOR STATUS ===");
  Serial.println("WiFi: " + String(WiFi.localIP()));
  Serial.println("Voltage: " + String(voltage, 2) + "V");
  Serial.println("Current 1: " + String(current1, 2) + "A");
  Serial.println("Current 2: " + String(current2, 2) + "A");
  Serial.println("Battery: " + String(percentage, 1) + "%");
  Serial.println("Temperature: " + String(temperature, 1) + "°C");
  
  Serial.print("Auto LEDs: ON, ON | Manual LEDs: ");
  for (int i = 0; i < NUM_MANUAL_LEDS; i++) {
    Serial.print(manualLedStates[i] ? "ON" : "OFF");
    if (i < NUM_MANUAL_LEDS - 1) Serial.print(", ");
  }
  Serial.println();
  Serial.println("=============================");
}

// Helper function to map float values
float mapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// API Documentation:
/*
 * GET / 
 * Returns JSON with all sensor data and LED states
 * 
 * GET /led?pin=X&state=Y
 * Controls manual LED (pin 0-5, state 0/1)
 * 
 * Hardware connections:
 * - GPIO36: Voltage sensor (0-15V via voltage divider)
 * - GPIO15: Current sensor 1 (ACS712 or similar)
 * - GPIO3:  Current sensor 2 (ACS712 or similar)
 * - GPIO16: Auto LED 1 (always ON)
 * - GPIO5:  Auto LED 2 (always ON)
 * - GPIO4:  Manual LED 0 (Headlamp)
 * - GPIO0:  Manual LED 1 (Car Light)
 * - GPIO2:  Manual LED 2 (Trafficator)
 * - GPIO14: Manual LED 3 (Rear Light)
 * - GPIO12: Manual LED 4 (Extra Light 1)
 * - GPIO13: Manual LED 5 (Extra Light 2)
 * 
 * Note: All LEDs connected via relays (Active LOW)
 */
