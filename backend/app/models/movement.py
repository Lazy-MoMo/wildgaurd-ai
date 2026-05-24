from pydantic import BaseModel
from datetime import datetime

class Movement(BaseModel):
    animal_id: str
    timestamp: datetime
    location: dict           # {lat, lng}
    speed: float             # km/h
    direction: float         # degrees 0-360
    behavior: str            # grazing | resting | moving | distress | aggressive
    confidence: float        # 0.0 - 1.0

class MovementCreate(BaseModel):
    animal_id: str
    location: dict
    speed: float
    direction: float
