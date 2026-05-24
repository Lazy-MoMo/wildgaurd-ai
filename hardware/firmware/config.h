// WildGuard AI — ESP32 + NEO-6M Only Configuration
#pragma once

// ─── GPS (NEO-6M via UART) ─────────────────────────────
#define GPS_RX_PIN       16
#define GPS_TX_PIN       17
#define GPS_BAUD         9600
#define GPS_POLL_MS      30000   // Read GPS every 30 seconds

// ─── WiFi ──────────────────────────────────────────────
#define WIFI_SSID        "YOUR_SSID"
#define WIFI_PASSWORD    "YOUR_PASSWORD"
#define BACKEND_URL      "http://192.168.1.100:8000"  // your laptop's IP

// ─── Animal Identity ───────────────────────────────────
#define ANIMAL_ID        "ELE_001"   // change per collar

// ─── Optional cheap deterrents (comment out if not wired) ──
// #define BUZZER_PIN    32
// #define LED_PIN       33

// ─── Power ─────────────────────────────────────────────
#define LIGHT_SLEEP_BETWEEN_POLLS   // use light sleep to save battery
