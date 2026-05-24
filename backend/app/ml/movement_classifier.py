"""
Movement Classifier — Random Forest model that runs both:
  1. On-device (TFLite on ESP32) for real-time behavior detection
  2. Server-side for historical analysis and retraining

Input features: speed, direction, time_of_day_sin, time_of_day_cos,
                speed_change, direction_change, rolling_avg_speed_6h
Output: grazing | resting | moving | distress | aggressive
"""
import numpy as np
import joblib
from datetime import datetime

BEHAVIOR_CLASSES = ["grazing", "resting", "moving", "distress", "aggressive"]

class MovementClassifier:
    def __init__(self, model_path: str = None):
        self.model = None
        if model_path:
            self.load(model_path)

    def load(self, path: str):
        self.model = joblib.load(path)

    def extract_features(self, movement: dict, history: list = None) -> np.ndarray:
        """
        Build the 7-feature vector from a movement record.
        history: list of recent movement dicts for rolling average.
        """
        speed = movement.get("speed", 0)
        direction = movement.get("direction", 0)
        hour = datetime.utcnow().hour

        # Encode time cyclically
        time_sin = np.sin(2 * np.pi * hour / 24)
        time_cos = np.cos(2 * np.pi * hour / 24)

        # Rate of change (requires previous reading)
        speed_change = 0
        direction_change = 0
        if history and len(history) > 0:
            prev = history[0]
            speed_change = speed - prev.get("speed", speed)
            direction_change = abs(direction - prev.get("direction", direction))
            direction_change = min(direction_change, 360 - direction_change)

        # 6-hour rolling average speed
        rolling_speeds = [m.get("speed", 0) for m in (history or [])]
        rolling_avg = np.mean(rolling_speeds) if rolling_speeds else speed

        return np.array([[speed, direction, time_sin, time_cos,
                          speed_change, direction_change, rolling_avg]])

    def predict(self, movement: dict, history: list = None) -> tuple[str, float]:
        """Returns (behavior_label, confidence)."""
        if self.model is None:
            return "moving", 0.5  # fallback if model not loaded
        features = self.extract_features(movement, history)
        proba = self.model.predict_proba(features)[0]
        idx = np.argmax(proba)
        return BEHAVIOR_CLASSES[idx], float(proba[idx])
