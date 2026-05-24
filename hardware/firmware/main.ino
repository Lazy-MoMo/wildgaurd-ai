/**
 * WildGuard AI — ESP32 + NEO-6M Firmware
 *
 * Hardware: ESP32 DevKit + NEO-6M GPS module
 * Communication: WiFi → HTTP POST to FastAPI backend
 *
 * Wiring:
 *   NEO-6M TX  → ESP32 GPIO16 (RX2)
 *   NEO-6M RX  → ESP32 GPIO17 (TX2)
 *   NEO-6M VCC → 3.3V
 *   NEO-6M GND → GND
 *
 * Loop every GPS_POLL_MS:
 *   1. Read GPS fix from NEO-6M
 *   2. POST {animal_id, lat, lng, speed, direction} to backend
 *   3. Backend runs ML prediction; collar just sends raw data
 *   4. Light sleep to save battery
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include "config.h"

TinyGPSPlus    gps;
HardwareSerial gpsSerial(2);  // UART2 → RX=16, TX=17

// Track previous reading for speed/direction delta
float prevLat = 0, prevLng = 0;
unsigned long prevTime = 0;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  Serial.println("WildGuard AI — ESP32+GPS booting");
  connectWiFi();
}

void loop() {
  // Feed GPS parser
  while (gpsSerial.available())
    gps.encode(gpsSerial.read());

  if (gps.location.isUpdated() && gps.location.isValid()) {
    float lat  = gps.location.lat();
    float lng  = gps.location.lng();
    float speed = gps.speed.kmph();   // NEO-6M reports speed over ground
    float course = gps.course.deg();  // degrees from north

    Serial.printf("GPS: %.6f, %.6f  spd=%.1f km/h  crs=%.0f°\n",
                  lat, lng, speed, course);

    postMovement(lat, lng, speed, course);

    prevLat = lat; prevLng = lng;
    prevTime = millis();
  }

  // Light sleep between polls (keeps WiFi alive)
  delay(GPS_POLL_MS);
}

// ── WiFi ────────────────────────────────────────────────────────────────────

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n❌ WiFi failed — will retry");
  }
}

void ensureWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost — reconnecting...");
    connectWiFi();
  }
}

// ── HTTP POST ────────────────────────────────────────────────────────────────

void postMovement(float lat, float lng, float speed, float course) {
  ensureWiFi();

  StaticJsonDocument<256> doc;
  doc["animal_id"]  = ANIMAL_ID;
  doc["location"]["lat"] = lat;
  doc["location"]["lng"] = lng;
  doc["speed"]      = speed;
  doc["direction"]  = course;
  // Behavior classification happens server-side (no TFLite needed on device)

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/api/animals/movement");
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(body);
  if (code == 200) {
    Serial.println("✅ Movement sent");
  } else {
    Serial.printf("❌ HTTP %d\n", code);
  }
  http.end();
}
