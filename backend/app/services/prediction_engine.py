"""
PredictionEngine — wraps the LSTM breach predictor and risk scorer.
Called once per animal per prediction cycle (every 30 minutes).
"""
import numpy as np
from datetime import datetime, timedelta
from ..models.prediction import Prediction, PredictionFactors
from ..ml.breach_predictor import BreachPredictor
from ..ml.risk_scorer import RiskScorer

class PredictionEngine:
    def __init__(self):
        self.breach_predictor = BreachPredictor()
        self.risk_scorer = RiskScorer()

    async def predict(self, animal_id: str, movements: list) -> Prediction:
        """
        Run full prediction pipeline for one animal.
        movements: list of last 48 movement dicts, newest first.
        """
        # Build sequence array for LSTM: shape (1, 48, n_features)
        sequence = self._build_sequence(movements)

        # LSTM gives breach probability over next 6-12 hours
        breach_prob = self.breach_predictor.predict(sequence)

        # Contextual risk scoring
        factors = self._get_context_factors(movements[0])
        risk_score = self.risk_scorer.score(breach_prob, factors, movements[0])
        alert_level = self._alert_level(risk_score)

        # Extrapolate predicted location (simple dead reckoning for now)
        predicted_location = self._extrapolate_location(movements[:3])

        return Prediction(
            animal_id=animal_id,
            prediction_time=datetime.utcnow(),
            predicted_for=datetime.utcnow() + timedelta(hours=6),
            risk_score=risk_score,
            breach_probability=breach_prob,
            predicted_location=predicted_location,
            factors=factors,
            alert_level=alert_level,
        )

    def _build_sequence(self, movements: list) -> np.ndarray:
        """Convert movement dicts to (1, T, features) numpy array."""
        rows = []
        for m in reversed(movements):  # chronological order
            rows.append([
                m.get("location", {}).get("lat", 0),
                m.get("location", {}).get("lng", 0),
                m.get("speed", 0),
                m.get("direction", 0),
            ])
        arr = np.array(rows, dtype=np.float32)
        return arr[np.newaxis, :, :]  # (1, T, 4)

    def _get_context_factors(self, latest: dict) -> PredictionFactors:
        hour = datetime.utcnow().hour
        if 5 <= hour < 7 or 17 <= hour < 19:
            tod = "dawn" if hour < 12 else "dusk"
        elif 7 <= hour < 17:
            tod = "day"
        else:
            tod = "night"
        return PredictionFactors(
            time_of_day=tod,
            season="harvest",       # TODO: pull from agricultural calendar
            weather="clear",        # TODO: pull from OpenWeatherMap
            distance_to_settlement=1.5,  # TODO: calculate from geofence DB
        )

    def _alert_level(self, risk_score: int) -> int:
        if risk_score < 30:  return 0
        if risk_score < 60:  return 1
        if risk_score < 80:  return 2
        return 3

    def _extrapolate_location(self, recent: list) -> dict:
        if not recent:
            return {"lat": 0, "lng": 0}
        # Naive: take last known location
        return recent[0].get("location", {"lat": 0, "lng": 0})
