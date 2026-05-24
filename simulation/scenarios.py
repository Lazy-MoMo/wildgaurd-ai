"""
Pre-scripted demo scenarios for the hackathon presentation.
Each scenario pumps fake movement events into the backend via HTTP.
"""
import asyncio, httpx, random
from datetime import datetime

API_URL = "http://localhost:8000"

async def scenario_1_normal_grazing():
    """60 seconds — ELE_001 peacefully grazing, risk stays green."""
    print("▶ Scenario 1: Normal Grazing")
    for i in range(6):
        await httpx.AsyncClient().post(f"{API_URL}/api/animals/movement", json={
            "animal_id": "ELE_001",
            "location": {"lat": 27.5289 + random.gauss(0, 0.0002),
                         "lng": 84.3564 + random.gauss(0, 0.0002)},
            "speed": round(random.uniform(0.3, 0.8), 2),
            "direction": random.uniform(0, 360),
            "behavior": "grazing",
        })
        await asyncio.sleep(10)

async def scenario_2_village_approach():
    """120 seconds — ELE_001 moves toward village at dusk, risk escalates."""
    print("▶ Scenario 2: Village Approach at Dusk")
    target_lat, target_lng = 27.540, 84.370  # crop field
    lat, lng = 27.525, 84.355
    for i in range(12):
        lat += (target_lat - lat) * 0.15 + random.gauss(0, 0.0001)
        lng += (target_lng - lng) * 0.15 + random.gauss(0, 0.0001)
        speed = 2.5 + i * 0.2
        await httpx.AsyncClient().post(f"{API_URL}/api/animals/movement", json={
            "animal_id": "ELE_001",
            "location": {"lat": round(lat, 6), "lng": round(lng, 6)},
            "speed": round(speed, 2),
            "direction": 45.0,
            "behavior": "moving" if i < 8 else "distress",
        })
        await asyncio.sleep(10)

async def scenario_3_high_risk_distress():
    """90 seconds — ELE_002 distress near settlement, Level 3 alert."""
    print("▶ Scenario 3: High-Risk Distress Event")
    for i in range(9):
        await httpx.AsyncClient().post(f"{API_URL}/api/animals/movement", json={
            "animal_id": "ELE_002",
            "location": {"lat": 27.5350 + random.gauss(0, 0.001),
                         "lng": 84.3680 + random.gauss(0, 0.001)},
            "speed": round(random.uniform(5.0, 7.5), 2),
            "direction": random.uniform(0, 360),
            "behavior": "distress" if i < 5 else "aggressive",
        })
        await asyncio.sleep(10)

if __name__ == "__main__":
    import sys
    scenarios = {
        "1": scenario_1_normal_grazing,
        "2": scenario_2_village_approach,
        "3": scenario_3_high_risk_distress,
    }
    n = sys.argv[1] if len(sys.argv) > 1 else "1"
    asyncio.run(scenarios[n]())
