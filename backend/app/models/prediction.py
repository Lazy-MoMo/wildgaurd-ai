from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PredictionFactors(BaseModel):
    time_of_day: str         # dawn | day | dusk | night
    season: str              # harvest | non-harvest
    weather: str             # clear | rain | storm
    distance_to_settlement: float  # km

class Prediction(BaseModel):
    animal_id: str
    prediction_time: datetime
    predicted_for: datetime        # 6 hours ahead
    risk_score: int                # 0-100
    breach_probability: float      # 0.0-1.0
    predicted_location: dict       # {lat, lng}
    factors: PredictionFactors
    alert_level: int               # 0-3
