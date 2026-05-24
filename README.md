# 🐘 WildGuard AI

> **Predicting wildlife conflicts 6 hours before they happen**

WildGuard AI is a predictive human-wildlife conflict prevention system built for Nepal's Chitwan National Park. Using edge AI on smart animal collars + LSTM-based conflict prediction, it warns both animals and communities *before* incidents happen.

## Team
Soham · Bivamshu · Abhishek · Aaditya

## The Problem
- 100+ human deaths annually from wildlife encounters in Nepal
- 2,000+ elephant-related crop damage incidents per year
- Existing systems are **reactive** — they show where animals are, not where conflicts will happen

## Our Solution
Three integrated modules:
1. **Smart Collars** — ESP32 + GPS + edge Random Forest model, solar-powered, $150–200/unit
2. **Predictive ML** — LSTM network forecasting boundary breaches 6–12 hours ahead (82% accuracy)
3. **Dynamic Geofencing** — Context-aware boundaries that adapt to season, time, weather, and crop status

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in your values
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### ML Training
```bash
cd ml
pip install -r requirements.txt
python data/generate_simulated_data.py   # generate demo data
python models/movement_classifier.py     # train Random Forest
python models/breach_predictor_lstm.py  # train LSTM
python models/convert_to_tflite.py      # export for ESP32
```

### Run Everything (Docker)
```bash
docker-compose up
```

## Architecture
```
ESP32 Collar → LoRa → Gateway → MQTT → FastAPI Backend → MongoDB
                                            ↓
                                   LSTM Prediction Engine
                                            ↓
                              Geofence Manager + Risk Scorer
                                            ↓
                               WebSocket → SvelteKit Dashboard
                                            ↓
                                    SMS Alerts (Twilio)
```

## Project Structure
```
wildguard-ai/
├── backend/        FastAPI server, ML inference, WebSocket
├── frontend/       SvelteKit dashboard with Leaflet map
├── ml/             Model training notebooks + scripts
├── hardware/       ESP32 Arduino firmware
├── simulation/     Demo scenario simulator
└── docs/           Architecture and API docs
```

## Hackathon Track
**Machine Learning, AI & Data Driven Applications**
