import { BatteryTelemetry, BatteryCell, FaultAlert } from '../types/battery';

// Standard 18650 Li-ion OCV (Open Circuit Voltage) vs SoC lookup table
const OCV_SOC_TABLE: [number, number][] = [
  [3.00, 0],
  [3.30, 10],
  [3.41, 24], // matches the prototype photo: V=3.41V -> ~24% SoC
  [3.60, 40],
  [3.70, 52],
  [3.82, 65],
  [3.95, 80],
  [4.08, 92],
  [4.20, 100]
];

export function estimateSoCFromVoltage(voltage: number): number {
  if (voltage <= OCV_SOC_TABLE[0][0]) return 0;
  if (voltage >= OCV_SOC_TABLE[OCV_SOC_TABLE.length - 1][0]) return 100;
  
  for (let i = 0; i < OCV_SOC_TABLE.length - 1; i++) {
    const [v1, s1] = OCV_SOC_TABLE[i];
    const [v2, s2] = OCV_SOC_TABLE[i + 1];
    if (voltage >= v1 && voltage <= v2) {
      const ratio = (voltage - v1) / (v2 - v1);
      return Math.round((s1 + ratio * (s2 - s1)) * 10) / 10;
    }
  }
  return 50;
}

export function calculatePowerMw(voltage: number, currentMa: number): number {
  // P (mW) = V (V) * I (mA)
  return Math.round(voltage * Math.abs(currentMa));
}

// Generate realistic ESP32 Arduino C++ Firmware Code
export function generateEsp32Firmware(options: {
  wifiSsid: string;
  serverUrl: string;
  updateIntervalMs: number;
  ina219Address: string;
  lcdAddress: string;
}): string {
  return `/**
 * IoT Battery Health Monitoring & Telemetry Firmware
 * Target Microcontroller: ESP32 Dev Module
 * Sensors: INA219 (Voltage/Current/Power), DS18B20 (Temperature)
 * Display: 16x2 LCD via I2C PCF8574 backpack
 * Project: IoT-Based Smart Solar Battery Health Monitoring System
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_INA219.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Wi-Fi Credentials
const char* ssid = "${options.wifiSsid}";
const char* password = "YOUR_WIFI_PASSWORD";

// Telemetry Server Endpoint
const char* serverEndpoint = "${options.serverUrl}";
const unsigned long SEND_INTERVAL_MS = ${options.updateIntervalMs};

// Pin Assignments
#define ONE_WIRE_BUS 4     // DS18B20 Data Pin
#define RELAY_PIN 18       // Protection Relay Control Pin
#define STATUS_LED 2       // Onboard Status LED

// Hardware Objects
Adafruit_INA219 ina219(${options.ina219Address});
LiquidCrystal_I2C lcd(${options.lcdAddress}, 16, 2);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Normal operation: relay energized

  // Initialize LCD display
  Wire.begin(21, 22); // ESP32 default SDA=21, SCL=22
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Battery Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi...");

  // Initialize INA219 Current/Voltage Sensor
  if (!ina219.begin()) {
    Serial.println("Failed to find INA219 chip");
    lcd.setCursor(0, 1);
    lcd.print("INA219 Err");
  }

  // Initialize Temperature Sensor
  tempSensor.begin();

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
  }
  Serial.println("\\nWiFi Connected. IP: " + WiFi.localIP().toString());
  digitalWrite(STATUS_LED, HIGH);
  lcd.clear();
}

void loop() {
  // Read Electrical Telemetry from INA219
  float busVoltage_V = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = ina219.getPower_mW();

  // Read Temperature
  tempSensor.requestTemperatures();
  float temperature_C = tempSensor.getTempCByIndex(0);

  // Update 16x2 LCD Display (Exact Prototype Layout)
  // Line 1: Power(mW): XXX
  // Line 2: V:X.XX  I:XXX
  lcd.setCursor(0, 0);
  lcd.print("Power(mW):");
  lcd.print((int)power_mW);
  lcd.print("   "); // clear trailing characters

  lcd.setCursor(0, 1);
  lcd.print("V:");
  lcd.print(busVoltage_V, 2);
  lcd.print("  I:");
  char iBuf[8];
  sprintf(iBuf, "%03d", (int)abs(current_mA));
  lcd.print(iBuf);

  // Safety Protection Logic: Autonomous Hardware Trip
  if (busVoltage_V > 4.25 || busVoltage_V < 2.90 || temperature_C > 50.0 || abs(current_mA) > 2000.0) {
    digitalWrite(RELAY_PIN, LOW); // Trip protection relay!
    Serial.println("FAULT DETECTED: Protection Relay Tripped!");
  }

  // Send Telemetry to Web Dashboard via HTTP POST
  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = millis();
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverEndpoint);
      http.addHeader("Content-Type", "application/json");

      String payload = "{\\"voltage\\":" + String(busVoltage_V, 3) +
                       ",\\"current\\":" + String(current_mA, 1) +
                       ",\\"power\\":" + String(power_mW, 1) +
                       ",\\"temperature\\":" + String(temperature_C, 2) + "}";

      int httpResponseCode = http.POST(payload);
      if (httpResponseCode > 0) {
        Serial.println("Telemetry dispatched, HTTP code: " + String(httpResponseCode));
      }
      http.end();
    }
  }

  delay(200);
}
`;
}
