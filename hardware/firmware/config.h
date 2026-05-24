// WildGuard AI — ESP32 Collar Configuration
#pragma once

// ─── GPS ───────────────────────────────────────────────
#define GPS_RX_PIN       16
#define GPS_TX_PIN       17
#define GPS_BAUD         9600
#define GPS_POLL_MS      60000   // Read GPS every 60 seconds

// ─── LoRa ──────────────────────────────────────────────
#define LORA_SCK         5
#define LORA_MISO        19
#define LORA_MOSI        27
#define LORA_SS          18
#define LORA_RST         14
#define LORA_DIO0        26
#define LORA_FREQ        868E6  // 868 MHz (Asia)
#define LORA_TX_POWER    20

// ─── Deterrents ────────────────────────────────────────
#define VIBRATION_PIN    32      // MOSFET gate for vibration motor
#define BUZZER_PIN       33      // Active buzzer / speaker

// ─── Solar / Power ─────────────────────────────────────
#define BATTERY_ADC_PIN  34      // Voltage divider → ADC
#define SLEEP_TIMEOUT_MS 300000  // Deep sleep if no GPS fix for 5 min

// ─── ML Model ──────────────────────────────────────────
#define MODEL_ARENA_SIZE 64000   // TFLite interpreter arena (bytes)
#define N_FEATURES       7
#define N_CLASSES        5       // grazing|resting|moving|distress|aggressive

// ─── Network ───────────────────────────────────────────
#define GATEWAY_ADDRESS  0x01    // LoRa gateway node address
#define MY_ADDRESS       0x10    // This collar's address (unique per unit)
