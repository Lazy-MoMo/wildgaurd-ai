/**
 * WildGuard AI — ESP32 Collar Firmware
 *
 * Loop:
 *  1. Read GPS (every GPS_POLL_MS)
 *  2. Run TFLite behavior classifier on latest features
 *  3. Send location + behavior + battery via LoRa to gateway
 *  4. Receive alert_level from gateway
 *  5. Activate deterrent if alert_level > 0
 */

#include "config.h"
#include "gps_handler.h"
#include "lora_handler.h"
#include "ml_inference.h"
#include "deterrents.h"

GPSHandler   gps;
LoRaHandler  lora;
MLInference  ml;
Deterrents   deterrents;

unsigned long lastGpsRead = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("WildGuard AI Collar v1.0 booting...");

  gps.begin(GPS_RX_PIN, GPS_TX_PIN, GPS_BAUD);
  lora.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS, LORA_RST, LORA_DIO0, LORA_FREQ);
  ml.begin();
  deterrents.begin(VIBRATION_PIN, BUZZER_PIN);

  Serial.println("Ready.");
}

void loop() {
  // 1. Poll GPS on schedule
  if (millis() - lastGpsRead >= GPS_POLL_MS) {
    lastGpsRead = millis();

    GPSData gpsData = gps.read();
    if (!gpsData.valid) return;

    // 2. Classify behavior (edge inference, <500ms)
    float features[N_FEATURES] = {
      gpsData.speed, gpsData.direction,
      gpsData.timeSin, gpsData.timeCos,
      gpsData.speedChange, gpsData.directionChange,
      gpsData.rollingAvgSpeed
    };
    int behavior = ml.classify(features);
    float confidence = ml.lastConfidence();

    // 3. Send to gateway via LoRa
    lora.sendTelemetry(GATEWAY_ADDRESS, gpsData.lat, gpsData.lng,
                       gpsData.speed, gpsData.direction,
                       behavior, confidence, batterySoc());

    // 4. Listen for alert command (non-blocking, 2s window)
    int alertLevel = lora.receiveAlertLevel(2000);

    // 5. Activate deterrent
    deterrents.activate(alertLevel);
  }
}

float batterySoc() {
  int raw = analogRead(BATTERY_ADC_PIN);
  float voltage = raw * (3.3f / 4095.0f) * 2.0f;  // voltage divider ratio
  return constrain((voltage - 3.2f) / (4.2f - 3.2f) * 100.0f, 0.0f, 100.0f);
}
