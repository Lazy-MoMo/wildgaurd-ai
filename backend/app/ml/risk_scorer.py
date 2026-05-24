"""
RiskScorer — combines breach probability with contextual multipliers
to produce a 0–100 integer risk score.

Formula:
  raw = breach_prob × behavior_mult × time_mult × distance_mult
  risk_score = int(clip(raw × 100, 0, 100))
"""
from ..models.prediction import PredictionFactors

BEHAVIOR_MULTIPLIERS = {
    "grazing":    0.5,
    "resting":    0.3,
    "moving":     1.0,
    "distress":   1.6,
    "aggressive": 2.0,
}

TIME_MULTIPLIERS = {
    "dawn":  1.3,
    "day":   0.8,
    "dusk":  1.5,
    "night": 1.4,
}

class RiskScorer:
    def score(self, breach_prob: float, factors: PredictionFactors, movement: dict) -> int:
        behavior = movement.get("behavior", "moving")
        b_mult = BEHAVIOR_MULTIPLIERS.get(behavior, 1.0)
        t_mult = TIME_MULTIPLIERS.get(factors.time_of_day, 1.0)

        # Distance multiplier: closer to settlement = higher risk
        dist = factors.distance_to_settlement  # km
        d_mult = max(0.5, 2.0 - dist * 0.3)

        raw = breach_prob * b_mult * t_mult * d_mult
        return int(min(max(raw * 100, 0), 100))
