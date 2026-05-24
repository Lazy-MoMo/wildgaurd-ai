# Hardware — ESP32 + NEO-6M GPS

## Components (what you have)
- ESP32 DevKit v1
- NEO-6M GPS Module

## Wiring (4 wires)
| NEO-6M Pin | ESP32 Pin |
|------------|-----------|
| VCC        | 3.3V      |
| GND        | GND       |
| TX         | GPIO 16 (RX2) |
| RX         | GPIO 17 (TX2) |

## Arduino Libraries (install via Library Manager)
- **TinyGPSPlus** by Mikal Hart
- **ArduinoJson** by Benoit Blanchon

## How it works
1. ESP32 reads NMEA sentences from NEO-6M over UART2
2. TinyGPSPlus parses lat/lng/speed/course
3. ESP32 POSTs JSON to your laptop's FastAPI backend over WiFi
4. All ML inference (behavior classification + breach prediction) runs on backend
5. Dashboard shows live animal position + risk score

## Tips
- Get a GPS fix outdoors or near a window (can take 1–5 min cold start)
- Serial Monitor at 115200 baud to debug
- Update WIFI_SSID, WIFI_PASSWORD, and BACKEND_URL in config.h
- Find your laptop IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- ESP32 and laptop must be on the same WiFi network
