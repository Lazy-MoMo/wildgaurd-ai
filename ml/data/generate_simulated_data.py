"""
Generate realistic elephant movement data for hackathon demo.

Simulates:
- Random walk biased toward crop fields and water sources
- Dusk/dawn activity peaks
- 3 scripted conflict scenarios
- Realistic GPS noise
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random, os

# Chitwan National Park approximate center
BASE_LAT, BASE_LNG = 27.5289, 84.3564

FOOD_SOURCES = [  # crop fields near park boundary
    (27.540, 84.370), (27.525, 84.380), (27.535, 84.365),
]
WATER_SOURCES = [
    (27.530, 84.358), (27.520, 84.362),
]

BEHAVIORS_BY_HOUR = {
    **{h: "resting" for h in range(0, 5)},
    **{h: "moving" for h in range(5, 7)},    # dawn activity
    **{h: "grazing" for h in range(7, 16)},
    **{h: "moving" for h in range(16, 19)},  # dusk activity — highest conflict risk
    **{h: "grazing" for h in range(19, 21)},
    **{h: "resting" for h in range(21, 24)},
}

def simulate_animal(animal_id: str, start: datetime, hours: int = 168,
                    scenario: str = "normal") -> pd.DataFrame:
    records = []
    lat, lng = BASE_LAT + random.uniform(-0.02, 0.02), BASE_LNG + random.uniform(-0.02, 0.02)
    direction = random.uniform(0, 360)
    t = start

    for step in range(hours * 2):  # 30-min intervals
        hour = t.hour
        base_behavior = BEHAVIORS_BY_HOUR.get(hour, "grazing")

        # Scenario overrides
        if scenario == "village_approach" and 150 < step < 200:
            base_behavior = "moving"
            # Bias toward food sources
            target = FOOD_SOURCES[0]
            direction = np.degrees(np.arctan2(target[1] - lng, target[0] - lat)) % 360

        if scenario == "distress" and 180 < step < 220:
            base_behavior = "distress"
            direction += random.uniform(-60, 60)  # erratic

        # Speed based on behavior
        speed_map = {"resting": 0.1, "grazing": 0.5, "moving": 3.5, "distress": 5.0, "aggressive": 6.0}
        speed = speed_map.get(base_behavior, 1.0) + random.gauss(0, 0.3)
        speed = max(0, speed)

        # Move animal (approximate, ignores Earth curvature for small distances)
        direction += random.gauss(0, 15 if base_behavior != "distress" else 40)
        direction %= 360
        dist_deg = speed / 111.0 / 2  # km to degrees, 30-min step
        lat += dist_deg * np.cos(np.radians(direction)) + random.gauss(0, 0.0001)
        lng += dist_deg * np.sin(np.radians(direction)) + random.gauss(0, 0.0001)

        records.append({
            "timestamp": t,
            "animal_id": animal_id,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "speed": round(speed, 2),
            "direction": round(direction % 360, 1),
            "behavior": base_behavior,
        })
        t += timedelta(minutes=30)

    return pd.DataFrame(records)

def generate_all(output_dir: str = "ml/data/raw"):
    os.makedirs(output_dir, exist_ok=True)
    start = datetime(2024, 1, 1)
    dfs = []

    animals = [
        ("ELE_001", "normal"),
        ("ELE_002", "village_approach"),
        ("ELE_003", "distress"),
        ("ELE_004", "normal"),
        ("ELE_005", "normal"),
    ]
    for aid, scenario in animals:
        df = simulate_animal(aid, start, hours=720, scenario=scenario)  # 30 days
        dfs.append(df)
        print(f"  {aid}: {len(df)} records, scenario={scenario}")

    combined = pd.concat(dfs, ignore_index=True)
    path = f"{output_dir}/movements_simulated.csv"
    combined.to_csv(path, index=False)
    print(f"✅ {len(combined)} total records → {path}")
    return combined

if __name__ == "__main__":
    generate_all()
